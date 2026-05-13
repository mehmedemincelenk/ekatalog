import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CarouselSlideUnit from '../../layout/CarouselSlideUnit';

// Mocking dependencies to ensure stable snapshots
vi.mock('../utils/image', () => ({
  resolveVisualAssetUrl: (url: string) => url,
}));

describe('CarouselSlideUnit (Diamond Snapshot)', () => {
  const mockSlide = {
    id: 1,
    src: 'https://example.com/slide1.jpg',
    bg: 'bg-stone-200',
    label: 'Test Başlığı',
    sub: 'Test Açıklaması',
  };

  const commonProps = {
    onDeleteTrigger: vi.fn(),
    onOrderChange: vi.fn(),
    onUpload: vi.fn(),
    editingTargetSlideId: null,
  };

  it('Aktif slide görünümü snapshot ile eşleşmeli', () => {
    const { asFragment } = render(
      <CarouselSlideUnit
        {...commonProps}
        slideData={mockSlide}
        isCurrentlyActive={true}
        isAdmin={false}
        isCurrentlyUploading={false}
        currentIndex={1}
        totalSlides={3}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Pasif (Ghost) slide görünümü snapshot ile eşleşmeli', () => {
    const { asFragment } = render(
      <CarouselSlideUnit
        {...commonProps}
        slideData={mockSlide}
        isCurrentlyActive={false}
        isAdmin={false}
        isCurrentlyUploading={false}
        currentIndex={1}
        totalSlides={3}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Admin modunda aktif slide görünümü snapshot ile eşleşmeli', () => {
    const { asFragment } = render(
      <CarouselSlideUnit
        {...commonProps}
        slideData={mockSlide}
        isCurrentlyActive={true}
        isAdmin={true}
        isCurrentlyUploading={false}
        currentIndex={1}
        totalSlides={3}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
