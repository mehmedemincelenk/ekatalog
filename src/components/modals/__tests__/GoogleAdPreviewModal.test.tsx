import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  it('should render Step 1 onboarding screen with action options when open', () => {
    render(<GoogleAdPreviewModal isOpen={true} onClose={vi.fn()} />);

    // Check title & subtitle
    expect(screen.getByText('Google Reklamları')).not.toBeNull();
    expect(screen.getByText('Google Reklamları Nedir?')).not.toBeNull();
    expect(screen.getByText('Sponsorlu')).not.toBeNull();

    // Check action buttons
    expect(screen.getByText('⚡ Tek Tıkla Reklam Ver')).not.toBeNull();
    expect(screen.getByText('🎤 Soruları Yanıtla (Tavsiye Edilen)')).not.toBeNull();
  });

  it('should transition to Q&A flow when "Soruları Yanıtla" is clicked', () => {
    render(<GoogleAdPreviewModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('🎤 Soruları Yanıtla (Tavsiye Edilen)'));

    // Should render Soru 1 / 3
    expect(screen.getByText('Soru 1 / 3')).not.toBeNull();
    expect(screen.getByText('Anahtar Kelimeler')).not.toBeNull();
    expect(screen.getByText('soruyu yanıtlamak için aşağıdaki mikrofon butonuna basın ve konuşun.')).not.toBeNull();
  });

  it('should transition directly to Targeting flow when "Tek Tıkla Reklam Ver" is clicked', () => {
    render(<GoogleAdPreviewModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('⚡ Tek Tıkla Reklam Ver'));

    // Should skip Q&A and show Targeting step (Hedef Kitle)
    expect(screen.getByText('Hedef Kitle')).not.toBeNull();
    expect(screen.getByText('Mevcut Adresiniz')).not.toBeNull();
    expect(screen.getByText('Yakın Çevrem')).not.toBeNull();
  });
});
