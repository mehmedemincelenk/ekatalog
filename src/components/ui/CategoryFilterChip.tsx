import { memo } from 'react';
import { THEME } from '../../data/config';
import { CategoryFilterChipProps } from '../../types';

/**
 * CATEGORY FILTER CHIP (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Ultra-minimalist display chip for category navigation.
 * Standardized to have zero administrative state - actions moved to CategoryHeader.
 */
const CategoryFilterChip = memo(
  ({
    categoryName,
    isItemSelected,
    productCount,
    onSelect,
  }: CategoryFilterChipProps) => {
    const theme = THEME.searchFilter.categoryList.chip;

    return (
      <div
        className={`${theme.container} ${THEME.radius.chip} items-stretch shrink-0 select-none cursor-pointer transition-all overflow-hidden relative h-10 flex ${isItemSelected ? theme.active : theme.inactive}`}
        onClick={() => onSelect(categoryName)}
      >
        <div className="relative shrink-0 flex items-stretch z-10">
          <span
            className={`${theme.counter.base} ${isItemSelected ? theme.counter.active : theme.counter.inactive} h-full !text-[10px] !font-black`}
          >
            {productCount}
          </span>
        </div>
        <div
          className={`${theme.textButton} flex-1 flex items-center pointer-events-none px-4 active:scale-95 transition-transform !text-[10px]`}
        >
          <span
            className={`${isItemSelected ? theme.activeText : theme.inactiveText} font-bold whitespace-nowrap`}
          >
            {categoryName}
          </span>
        </div>
      </div>
    );
  },
);

export default CategoryFilterChip;
