import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FloatingGuestMenu } from '../FloatingMenus';

vi.mock('../store', () => ({
  useStore: () => ({
    settings: {
      activeCurrency: 'TRY',
      whatsapp: '905000000000'
    },
    updateSetting: vi.fn(),
    visitorCurrency: 'TRY',
    toggleVisitorCurrency: vi.fn(),
  }),
}));

describe('FloatingGuestMenu (Diamond Snapshot)', () => {
  it('misafir menüsü kilitli tasarım snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <FloatingGuestMenu 
        onCouponClick={vi.fn()}
        onExcelClick={vi.fn()}
        onSearchClick={vi.fn()}
        onQRClick={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('misafir menüsü açıldığında 4x2 grid yapısı doğru görünmeli', () => {
    const { asFragment, getByLabelText } = render(
      <FloatingGuestMenu 
        onCouponClick={vi.fn()}
        onExcelClick={vi.fn()}
        onSearchClick={vi.fn()}
        onQRClick={vi.fn()}
      />
    );
    
    const toggle = getByLabelText('Menüyü Aç');
    act(() => {
      fireEvent.click(toggle);
    });
    
    expect(asFragment()).toMatchSnapshot();
  });
});
