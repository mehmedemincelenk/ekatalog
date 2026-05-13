import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import HeroCarousel from '../../layout/HeroCarousel';

// Mocking dependencies for HeroCarousel
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { carousel_data: { slides: [] } }, error: null })),
        })),
      })),
    })),
  },
}));

vi.mock('../utils/core', () => ({
  getActiveStoreSlug: () => 'test-store',
  reorderArray: (arr: any[]) => arr,
}));

describe('HeroCarousel (Diamond Snapshot)', () => {
  it('Boş carousel görünümü (Admin) snapshot ile eşleşmeli', () => {
    const { asFragment } = render(
      <HeroCarousel isAdminModeActive={true} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Yükleniyor durumu snapshot ile eşleşmeli', () => {
    const { asFragment } = render(
      <HeroCarousel isAdminModeActive={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
