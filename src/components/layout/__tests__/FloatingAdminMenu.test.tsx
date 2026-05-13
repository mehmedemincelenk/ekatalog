import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FloatingAdminMenu } from '../FloatingMenus';

vi.mock('../../../store', () => ({
  useStore: () => ({
    settings: {
      activeCurrency: 'TRY',
    },
    updateSetting: vi.fn(),
  }),
}));

describe('FloatingAdminMenu (Diamond Snapshot)', () => {
  it('admin menüsü kilitli tasarım snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <FloatingAdminMenu 
        onProductAddTrigger={vi.fn()}
        onBulkUpdateTrigger={vi.fn()}
        onSettingsTrigger={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('admin menüsü açıldığında butonlar doğru görünmeli', () => {
    const { asFragment, getByLabelText } = render(
      <FloatingAdminMenu 
        onProductAddTrigger={vi.fn()}
        onBulkUpdateTrigger={vi.fn()}
        onSettingsTrigger={vi.fn()}
      />
    );
    
    const toggle = getByLabelText('Menüyü Aç');
    act(() => {
      fireEvent.click(toggle);
    });
    
    expect(asFragment()).toMatchSnapshot();
  });
});
