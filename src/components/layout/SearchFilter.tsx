import { memo } from 'react';
import * as Lucide from 'lucide-react';
import { THEME, LABELS } from '../../data/config';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../ui/Button';
import CategoryFilterChip from '../ui/CategoryFilterChip';
import FormInput from '../ui/FormInput';
import { SearchFilterProps } from '../../types';
import { useSearchFilterFlow } from '../../hooks/useSearchFilterFlow';

/**
 * SEARCH FILTER COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Hybrid interaction engine for category navigation.
 * Uses centralized analytics from useCatalogEngine.
 */
const SearchFilter = memo(
  ({ sortedList = [], stats = {} }: SearchFilterProps) => {
    const flow = useSearchFilterFlow();

    const displayConfig = flow.settings?.displayConfig || {
      showSearch: true,
      showCategories: true,
    };
    const filterTheme = THEME.searchFilter;
    const globalIcons = THEME.icons;

    const showAll = displayConfig.showSearch || displayConfig.showCategories;
    if (!showAll && !flow.isAdmin) return null;

    // Diamond Logic: Always follow mobile interaction rules.
    const mobileInitialLimit = 5;
    const hasMoreThanLimit = sortedList.length > mobileInitialLimit;

    const visibleList =
      flow.isPanelOpen || !hasMoreThanLimit
        ? sortedList
        : sortedList.slice(0, mobileInitialLimit);

    const renderCategoryList = (list: string[]) => (
      <>
        {list.map((cat) => (
          <CategoryFilterChip
            key={cat}
            categoryName={cat}
            isItemSelected={flow.activeCategories.includes(cat)}
            isAdminMode={false}
            productCount={stats[cat] || 0}
            onSelect={flow.onCategoryToggle}
          />
        ))}

        {/* MOBILE "MORE" CHIP */}
        {!flow.isPanelOpen && hasMoreThanLimit && (
          <Button
            onClick={() => flow.setIsPanelOpen(true)}
            variant="secondary"
            mode="rectangle"
            className="flex px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shrink-0 !rounded-xl border-stone-200 border-dashed border-2 hover:border-stone-900 transition-all text-stone-400 hover:text-stone-900"
          >
            + DAHA FAZLA
          </Button>
        )}
      </>
    );

    return (
      <div
        className={`w-full bg-stone-50 py-2 relative z-40 ${!showAll ? 'opacity-50 grayscale' : ''}`}
      >
        <div
          className={`${filterTheme.container} !flex-col !items-stretch !gap-0`}
        >
          {/* TOP BAR: Search & Interaction */}
          <div className="flex flex-row items-center gap-2 w-full">
            {displayConfig.showSearch && (
              <div
                className={`${filterTheme.searchArea.inputWrapper} ${THEME.radius.input} flex-1 h-11 !max-w-none w-full flex items-center border-2 border-stone-200 bg-white focus-within:border-stone-900 transition-all`}
              >
                <div className={filterTheme.searchArea.iconSize}>
                  {globalIcons.search}
                </div>
                <FormInput
                  id="mobile-search-input"
                  type="text"
                  value={flow.internalSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    flow.setInternalSearch(e.target.value)
                  }
                  placeholder={LABELS.filter.searchPlaceholder}
                  className="!pl-9 !border-none !bg-transparent !h-full !text-base font-bold placeholder:text-stone-400"
                  containerClassName="flex-1 h-full"
                />
              </div>
            )}

            {displayConfig.showCategories && (
              <div
                className={`flex-none flex items-center justify-start gap-2 overflow-hidden ${
                  !displayConfig.showSearch ? 'w-full' : ''
                }`}
              >
                <Button
                  onClick={() => flow.setIsPanelOpen(!flow.isPanelOpen)}
                  variant="glass"
                  mode={!displayConfig.showSearch ? 'rectangle' : 'square'}
                  className={`h-11 flex-none !rounded-lg !bg-stone-900/60 backdrop-blur-md border-white/20 text-white shadow-xl hover:!bg-stone-900/80 transition-all !p-0 ${
                    !displayConfig.showSearch ? 'w-full gap-2 px-4' : 'w-11'
                  }`}
                  icon={
                    flow.isPanelOpen ? (
                      <Lucide.ChevronUp size={20} strokeWidth={2.2} />
                    ) : (
                      <Lucide.ChevronDown size={20} strokeWidth={2.2} />
                    )
                  }
                  aria-label={LABELS.filter.categoryBtn}
                >
                  {!displayConfig.showSearch && (
                    <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none">
                      KATEGORİLER
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* EXPANDED PANEL */}
          {displayConfig.showCategories && (
            <AnimatePresence>
              {flow.isPanelOpen && (
                <motion.div
                  key="expanded-categories"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap justify-start items-center gap-2 pt-3 pb-1 w-full">
                    {renderCategoryList(visibleList)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {!showAll && flow.isAdmin && (
            <div className="text-[10px] font-black uppercase text-stone-400 text-center py-2 italic">
              Bu alan gizli (Sadece Admin Görür)
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default SearchFilter;
