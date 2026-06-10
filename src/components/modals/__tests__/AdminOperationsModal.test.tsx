import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminOperationsModal from '../AdminOperationsModal';
import { useStore } from '../../../store';
import { Product } from '../../../types';

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

// Mock window.open
beforeEach(() => {
  window.open = vi.fn();
  // Reset zustand store to defaults
  useStore.setState({
    activeModal: null,
    modalData: null,
  });
});

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Elma',
    category: 'Meyve',
    price: '10,00 ₺',
    out_of_stock: false,
    is_archived: false,
    image_url: 'http://test.com/elma.jpg',
  },
  {
    id: 'prod-2',
    name: 'Armut',
    category: 'Meyve',
    price: '15,50 ₺',
    out_of_stock: true,
    is_archived: false,
    image_url: '',
  },
  {
    id: 'prod-3',
    name: 'Ispanak',
    category: 'Sebze',
    price: '8,00 ₺',
    out_of_stock: false,
    is_archived: true,
    image_url: '',
  },
] as Product[];

const mockCategories = ['Meyve', 'Sebze'];

describe('AdminOperationsModal Component (Diamond Standard)', () => {
  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <AdminOperationsModal
        isOpen={false}
        onClose={vi.fn()}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render Step 1 with single actions and bulk actions list', () => {
    render(
      <AdminOperationsModal
        isOpen={true}
        onClose={vi.fn()}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
      />
    );

    // Header title
    expect(screen.getByText('İŞLEMLER')).not.toBeNull();

    // Single Actions
    expect(screen.getByText('ÜRÜN EKLE')).not.toBeNull();
    expect(screen.getByText('KATEGORİ EKLE')).not.toBeNull();
    expect(screen.getByText('REFERANS EKLE')).not.toBeNull();
    expect(screen.getByText('AFİŞ EKLE')).not.toBeNull();

    // Bulk Actions
    expect(screen.getByText('FİYAT DURUMU')).not.toBeNull();
    expect(screen.getByText('STOK DURUMU')).not.toBeNull();
    expect(screen.getByText('YAYIN DURUMU')).not.toBeNull();
    expect(screen.getByText('SİL İŞLEMİ')).not.toBeNull();
    expect(screen.getByText('TOPLU ÜRÜN YÜKLE')).not.toBeNull();
  });

  it('should trigger add product modal state change on ÜRÜN EKLE click', () => {
    const handleClose = vi.fn();
    render(
      <AdminOperationsModal
        isOpen={true}
        onClose={handleClose}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('ÜRÜN EKLE'));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(useStore.getState().activeModal).toBe('ADD_PRODUCT');
  });

  it('should trigger onAddAction callback when KATEGORİ EKLE / REFERANS EKLE / AFİŞ EKLE is clicked', () => {
    const handleAddAction = vi.fn();
    const handleClose = vi.fn();
    
    const { rerender } = render(
      <AdminOperationsModal
        isOpen={true}
        onClose={handleClose}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
        onAddAction={handleAddAction}
      />
    );

    fireEvent.click(screen.getByText('KATEGORİ EKLE'));
    expect(handleAddAction).toHaveBeenCalledWith('CATEGORY');
    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(
      <AdminOperationsModal
        isOpen={true}
        onClose={handleClose}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
        onAddAction={handleAddAction}
      />
    );
    fireEvent.click(screen.getByText('REFERANS EKLE'));
    expect(handleAddAction).toHaveBeenCalledWith('REFERENCE');

    rerender(
      <AdminOperationsModal
        isOpen={true}
        onClose={handleClose}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
        onAddAction={handleAddAction}
      />
    );
    fireEvent.click(screen.getByText('AFİŞ EKLE'));
    expect(handleAddAction).toHaveBeenCalledWith('CAROUSEL');
  });

  it('should navigate to Bulk Upload screen and support WhatsApp redirection', () => {
    render(
      <AdminOperationsModal
        isOpen={true}
        onClose={vi.fn()}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('TOPLU ÜRÜN YÜKLE'));
    
    // Check screen contents
    expect(screen.getByText('TOPLU YÜKLE')).not.toBeNull();
    expect(screen.getByText('ÜCRETSİZ TOPLU YÜKLEME')).not.toBeNull();
    
    // Click WhatsApp submit
    fireEvent.click(screen.getByText('WHATSAPP İLE GÖNDER'));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should navigate to Category selection on stock bulk action click', () => {
    render(
      <AdminOperationsModal
        isOpen={true}
        onClose={vi.fn()}
        allProducts={mockProducts}
        categories={mockCategories}
        onGranularUpdate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('STOK DURUMU'));
    
    // Should render step 2 - Category Title
    expect(screen.getByText('KATEGORİ')).not.toBeNull();
    // Categories filter chips should exist
    expect(screen.getByText('Meyve')).not.toBeNull();
    expect(screen.getByText('Sebze')).not.toBeNull();
  });
});
