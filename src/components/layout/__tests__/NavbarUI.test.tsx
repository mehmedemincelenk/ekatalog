import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Navbar from '../Navbar';
import { useStore } from '../../../store';
import { useSettings } from '../../../hooks/useSettingsHub';

// Mock the store and hooks
vi.mock('../../../store');
vi.mock('../../../hooks/useSettingsHub');

describe('Navbar UI (Diamond Lock)', () => {
  it('should match the current snapshot (Aesthetics Lockdown)', () => {
    // Mock default state
    (useStore as any).mockReturnValue({
      isAdmin: false,
      settings: {
        title: 'Diamond Store',
        subtitle: 'ÖMER KÖSE',
        logoUrl: '',
        displayConfig: {
          showLogo: true,
          showSearch: true,
          showWhatsapp: true,
          showInstagram: true
        }
      }
    });

    (useSettings as any).mockReturnValue({
      updateSetting: vi.fn(),
      isInitialLoading: false
    });

    const { asFragment } = render(
      <Navbar 
        onLogoPointerDown={vi.fn()} 
        onLogoPointerUp={vi.fn()} 
        isInlineEnabled={false} 
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
