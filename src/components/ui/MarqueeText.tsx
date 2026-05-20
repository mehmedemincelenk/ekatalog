import { useRef, useState, useEffect, memo } from 'react';
import { THEME } from '../../data/config';
import { MarqueeTextProps } from '../../types';

export const MarqueeText = memo(({ text, textClass, isAdmin, editableProps = {}, onClick }: MarqueeTextProps) => {
  const r = useRef<HTMLDivElement>(null);
  const [o, sO] = useState(false);
  const { className: eC = '', onClick: iO, ...eP } = editableProps;
  const t = THEME.typography.marquee;

  useEffect(() => {
    const el = r.current; if (!el) return;
    const ck = () => sO(el.scrollWidth > el.clientWidth + 2);
    ck(); const ob = new ResizeObserver(ck); ob.observe(el);
    return () => ob.disconnect();
  }, [text]);

  return (
    <div ref={r} onClick={(e) => { if (iO) (iO as React.MouseEventHandler<HTMLDivElement>)(e); if (onClick) onClick(e); }} className={`${isAdmin ? t.adminMode : t.container} ${textClass} ${eC}`} {...eP}>
      {o && !isAdmin ? <span className={t.track}>{text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;</span> : <span>{text}</span>}
    </div>
  );
});
