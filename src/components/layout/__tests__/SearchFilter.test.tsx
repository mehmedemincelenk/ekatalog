import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchFilter from '../../layout/SearchFilter';

// Mock dependencies
vi.mock('../store', () => ({
  useStore: () => ({
    isAdmin: false,
    settings: {
      displayConfig: {
        showSearch: true,
        showCategories: true,
      },
    },
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeCategories: [],
    toggleCategory: vi.fn(),
  }),
}));

describe('SearchFilter Diamond UI', () => {
  it('should match the locked diamond snapshot', () => {
    const { asFragment } = render(
      <SearchFilter 
        sortedList={['Giyim', 'Aksesuar', 'Ayakkabı']}
        stats={{ 'Giyim': 10, 'Aksesuar': 5, 'Ayakkabı': 2 }}
        renameCategory={vi.fn()}
        onCategoryOrderChange={vi.fn()}
        onAddCategory={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
