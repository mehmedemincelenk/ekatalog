import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProductCardUI from '../../layout/ProductCardUI';

describe('ProductCardUI (Diamond Snapshot)', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Ürünü',
    description: 'Harika bir test açıklaması',
    price: '150.00',
    category: 'Test',
    image_url: 'https://example.com/image.jpg',
    out_of_stock: false,
    is_archived: false
  };

  it('Normal görünüm snaphotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <ProductCardUI 
        product={mockProduct as any} 
        displayCurrency="TRY"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Admin görünümü snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <ProductCardUI 
        product={mockProduct as any} 
        displayCurrency="TRY"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Stokta olmayan görünüm snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(
      <ProductCardUI 
        product={{ ...mockProduct, out_of_stock: true } as any} 
        displayCurrency="TRY"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
