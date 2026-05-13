import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BaseFloatingMenu from '../../layout/BaseFloatingMenu';
import { Menu } from 'lucide-react';

describe('BaseFloatingMenu (Diamond Snapshot)', () => {
  const mockActions = [
    { id: '1', label: 'Action 1', action: () => {}, icon: <span>1</span> },
    { id: '2', label: 'Action 2', action: () => {}, icon: <span>2</span> },
    { id: '3', label: '', action: () => {}, icon: <span>3</span> },
    { id: '4', label: '', action: () => {}, icon: <span>4</span> },
  ];

  it('Default görünüm (kapalı) snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <BaseFloatingMenu 
        actions={mockActions}
        labelText="MENÜ"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Admin (AYARLAR) görünümü snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <BaseFloatingMenu 
        actions={mockActions}
        labelText="AYARLAR"
        mainIcon={<Menu />}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
