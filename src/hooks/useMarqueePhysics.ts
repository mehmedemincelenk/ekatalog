import { useRef, useEffect } from 'react';

/**
 * CUSTOM HOOK: useMarqueePhysics
 * -----------------------------------------------------------
 * Encapsulates high-performance, requestAnimationFrame-driven
 * physics loop for horizontal scrolling marquee with inertial
 * grab-and-drag mechanics and continuous infinite wrapping.
 */
export function useMarqueePhysics(activeReferencesLength: number, _isAdmin: boolean, isPaused: boolean = false) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const velocity = useRef(0);
  const isDown = useRef(false);
  const hasCaptured = useRef(false);
  const startX = useRef(0);
  const startXOffset = useRef(0);
  const lastClientX = useRef(0);
  const lastMoveTime = useRef(0);
  const lastTime = useRef(0);

  const baseSpeedRef = useRef(-28); // Pixels per second to slide left

  useEffect(() => {
    const track = trackRef.current;
    if (!track || activeReferencesLength === 0) return;

    let animationFrameId: number;

    const updateHighlights = () => {
      const children = track.children;
      if (!children.length) return;

      const parent = track.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const containerCenter = parentRect.left + parentRect.width / 2;
      
      // Dynamic maxDistance: 45% of parent container width, capped at 160px for a sharp focal zone
      const maxDistance = Math.min(160, parentRect.width * 0.45);

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const rect = child.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - itemCenter);

        let highlight = 0;
        if (distance < maxDistance) {
          // Smooth bell-curve cosine transition
          const ratio = distance / maxDistance;
          highlight = Math.cos((ratio * Math.PI) / 2);
        }

        const img = child.querySelector('img') as HTMLElement;
        if (img) {
          const grayscaleVal = 100 - highlight * 100;
          const opacityVal = 0.35 + highlight * 0.65; // 0.35 to 1.0

          img.style.filter = `grayscale(${grayscaleVal}%)`;
          img.style.opacity = `${opacityVal}`;
        } else {
          const span = child.querySelector('span') as HTMLElement;
          if (span) {
            const opacityVal = 0.45 + highlight * 0.55; // 0.45 to 1.0
            span.style.opacity = `${opacityVal}`;
            span.style.color = highlight > 0.5 ? '#1c1917' : '#a8a29e';
          }
        }
      }
    };

    const animate = (time: number) => {
      if (!lastTime.current) {
        lastTime.current = time;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      let dt = (time - lastTime.current) / 1000;
      if (dt < 0 || dt > 0.1) dt = 0.016; // Safeguard tab backgrounding

      const halfWidth = track.scrollWidth / 2;

      // Infinite wrapping boundary check
      if (halfWidth > 0) {
        if (xRef.current <= -halfWidth) {
          xRef.current += halfWidth;
        } else if (xRef.current >= 0) {
          xRef.current -= halfWidth;
        }
      }

      const baseSpeed = baseSpeedRef.current;

      if (!isDown.current && !isPaused) {
        // INERTIA DECELERATION & AUTO-SCROLL PHYSICS
        if (Math.abs(velocity.current) > Math.abs(baseSpeed)) {
          // Decelerate with time-independent exponential friction
          velocity.current *= Math.pow(0.96, dt * 60);

          // Once it decays close to base speed, seamlessly lock to base speed
          if (Math.abs(velocity.current) <= Math.abs(baseSpeed) + 5) {
            velocity.current = baseSpeed;
          }
        } else {
          // Gently accelerate/merge back to base speed in the active direction
          velocity.current = velocity.current * 0.95 + baseSpeed * 0.05;
        }

        xRef.current += velocity.current * dt;
        track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      }

      // Smoothly update visual highlights on every frame
      updateHighlights();

      lastTime.current = time;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lastTime.current = 0;
    };
  }, [activeReferencesLength, isPaused]);

  // Unified Pointer Drag Handlers (Cross-platform mouse client coordinates & touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDown.current = true;
    startX.current = e.clientX;
    startXOffset.current = xRef.current;
    lastClientX.current = e.clientX;
    lastMoveTime.current = performance.now();
    velocity.current = 0;
    hasCaptured.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    const track = trackRef.current;
    if (!track) return;

    const totalDragDx = e.clientX - startX.current;

    // Capture pointer only if dragging exceeds a threshold of 5 pixels
    if (!hasCaptured.current && Math.abs(totalDragDx) > 5) {
      const el = e.currentTarget as HTMLElement;
      try {
        el.setPointerCapture(e.pointerId);
        hasCaptured.current = true;
      } catch (err) {}
    }

    const now = performance.now();
    const dt = (now - lastMoveTime.current) / 1000;
    const dx = e.clientX - lastClientX.current;

    xRef.current = startXOffset.current + totalDragDx;
    track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;

    if (dt > 0) {
      // Calculate instant drag speed
      const instantVelocity = dx / dt;
      // Smooth using low-pass filter to reject coordinate jitter
      velocity.current = velocity.current * 0.3 + instantVelocity * 0.7;
    }

    lastClientX.current = e.clientX;
    lastMoveTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    isDown.current = false;
    
    if (hasCaptured.current) {
      const el = e.currentTarget as HTMLElement;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (err) {}
      hasCaptured.current = false;
    }

    // Adapt automatic scroll direction to the user's drag gesture direction
    const totalDragDx = e.clientX - startX.current;
    if (Math.abs(totalDragDx) > 10) {
      baseSpeedRef.current = totalDragDx > 0 ? 28 : -28;
    }
  };

  return {
    trackRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
