import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GoogleAdPreviewModal from '../GoogleAdPreviewModal';
import { useStore } from '../../../store';

// Mock motion/react to avoid animation issues in test environment
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

beforeEach(() => {
  // Reset store
  useStore.setState({
    activeCampaign: {
      status: 'none',
      budget: 0,
      refCode: '',
    },
  });
});

describe('GoogleAdPreviewModal Component (Diamond Standard)', () => {
  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <GoogleAdPreviewModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render Step 1 onboarding screen and proceed to Step 2 when DEVAM ET is clicked', () => {
    render(<GoogleAdPreviewModal isOpen={true} onClose={vi.fn()} />);

    // Check title & subtitle
    expect(screen.getByText('Google Reklamları')).not.toBeNull();
    expect(screen.getByText('1. Toplam Müşteri Araması')).not.toBeNull();
    expect(screen.getByText('Sponsorlu')).not.toBeNull();
    expect(screen.getByText('DEVAM ET')).not.toBeNull();

    // Go to Step 2
    fireEvent.click(screen.getByText('DEVAM ET'));

    // Check action buttons in Step 2
    expect(screen.getByText('⚡ Tek Tıkla Reklam Ver')).not.toBeNull();
    expect(screen.getByText('🎤 Soruları Yanıtla (Tavsiye Edilen)')).not.toBeNull();
  });

  it('should transition to Q&A flow when "Soruları Yanıtla" is clicked on Step 2', () => {
    render(<GoogleAdPreviewModal isOpen={true} onClose={vi.fn()} />);

    // Go to Step 2
    fireEvent.click(screen.getByText('DEVAM ET'));
    
    // Choose QA
    fireEvent.click(screen.getByText('🎤 Soruları Yanıtla (Tavsiye Edilen)'));

    // Should render Soru 1 / 3
    expect(screen.getByText('Soru 1 / 3')).not.toBeNull();
    expect(screen.getByText('Anahtar Kelimeler')).not.toBeNull();
    expect(screen.getByText('soruyu yanıtlamak için aşağıdaki mikrofon butonuna basın ve konuşun.')).not.toBeNull();
  });

  it('should transition directly to Address Approval flow when "Tek Tıkla Reklam Ver" is clicked on Step 2', () => {
    render(<GoogleAdPreviewModal isOpen={true} onClose={vi.fn()} />);

    // Go to Step 2
    fireEvent.click(screen.getByText('DEVAM ET'));

    // Choose Quick Ads
    fireEvent.click(screen.getByText('⚡ Tek Tıkla Reklam Ver'));

    // Should skip Q&A and show Address Approval step (Adres Onayı)
    expect(screen.getByText('Adres Onayı')).not.toBeNull();
    expect(screen.getByText('Mevcut Adresiniz')).not.toBeNull();
    expect(screen.getByText('ADRESİ ONAYLA')).not.toBeNull();

    // Type address confirmation to enable the button
    const addressInput = screen.getByPlaceholderText('adresim doğru yazıyor yazın');
    fireEvent.change(addressInput, { target: { value: 'adresim doğru yazıyor' } });

    // Confirm address to proceed to targeting settings (Hedef Kitle)
    fireEvent.click(screen.getByText('ADRESİ ONAYLA'));
    expect(screen.getByText('Hedef Kitle')).not.toBeNull();
    expect(screen.getByText('Yakın Çevrem')).not.toBeNull();
  });
});
