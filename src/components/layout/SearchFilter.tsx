import { memo } from 'react';
import * as Lucide from 'lucide-react';
import { THEME, LABELS } from '../../data/config';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../ui/Button';
import CategoryFilterChip from '../ui/CategoryFilterChip';
import { QuickEditModal } from '../modals/UtilityModals';
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
  ({
    sortedList = [],
    stats = {},
    onCategoryOrderChange,
    renameCategory,
    onAddCategory,
  }: SearchFilterProps) => {
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
        {/* ADMIN: KATEGORİ YÖNETİM GRUBU */}
        {flow.isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            {/* DÜZENLE (Pencil) */}
            <Button
              variant="glass"
              mode="square"
              className={`w-8 h-8 !bg-stone-900/60 backdrop-blur-md border border-white/20 text-white shadow-xl !rounded-lg !p-0 transition-all ${flow.adminAction === 'EDIT' ? '!bg-amber-500 ring-2 ring-amber-400' : ''}`}
              icon={<Lucide.Pencil size={14} strokeWidth={3} />}
              onClick={() =>
                flow.setAdminAction((prev) =>
                  prev === 'EDIT' ? 'IDLE' : 'EDIT',
                )
              }
              title="Kategoriyi Düzenle (Tıkla ve Chip'e Bas)"
            />

            {/* SİL (Trash) */}
            <Button
              variant="glass"
              mode="square"
              className={`w-8 h-8 !bg-stone-900/60 backdrop-blur-md border border-white/20 text-white shadow-xl !rounded-lg !p-0 transition-all ${flow.adminAction === 'DELETE' ? '!bg-red-600 ring-2 ring-red-500' : ''}`}
              icon={<Lucide.Trash2 size={14} strokeWidth={3} />}
              onClick={() =>
                flow.setAdminAction((prev) =>
                  prev === 'DELETE' ? 'IDLE' : 'DELETE',
                )
              }
              title="Kategoriyi Sil (Tıkla ve Chip'e Bas)"
            />
          </div>
        )}

        {list.map((cat) => (
          <CategoryFilterChip
            key={cat}
            categoryName={cat}
            isItemSelected={flow.activeCategories.includes(cat)}
            isAdminMode={flow.isAdmin}
            productCount={stats[cat] || 0}
            onSelect={flow.onCategoryToggle}
            onRename={renameCategory}
            onOrderChange={onCategoryOrderChange}
            orderIndex={sortedList.indexOf(cat)}
            totalCategories={sortedList.length}
            adminActionOverride={flow.adminAction}
            onDelete={flow.handleDeleteCategory}
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
        <div className={`${filterTheme.container} !flex-col !items-stretch`}>
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
              <div className="flex-none flex items-center justify-start gap-2 overflow-hidden">
                <Button
                  onClick={() => flow.setIsPanelOpen(!flow.isPanelOpen)}
                  variant="glass"
                  mode="square"
                  className="h-11 w-11 flex-none !rounded-lg !bg-stone-900/60 backdrop-blur-md border-white/20 text-white shadow-xl hover:!bg-stone-900/80 transition-all !p-0"
                  icon={
                    flow.isPanelOpen ? (
                      <Lucide.ChevronUp size={20} strokeWidth={2.2} />
                    ) : (
                      <Lucide.ChevronDown size={20} strokeWidth={2.2} />
                    )
                  }
                  aria-label={LABELS.filter.categoryBtn}
                />
              </div>
            )}
          </div>

          {/* EXPANDED PANEL */}
          {displayConfig.showCategories && flow.isPanelOpen && (
            <div className="mt-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key="expanded-categories"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap justify-start items-center gap-2 py-1 w-full">
                    {renderCategoryList(visibleList)}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {!showAll && flow.isAdmin && (
            <div className="text-[10px] font-black uppercase text-stone-400 text-center py-2 italic">
              Bu alan gizli (Sadece Admin Görür)
            </div>
          )}
        </div>

        <QuickEditModal
          isOpen={flow.isAddingCategory}
          onClose={() => flow.setIsAddingCategory(false)}
          onSave={(name: string) => {
            if (name.trim()) onAddCategory?.(name.trim());
          }}
          placeholder="Kategori adı..."
          initialValue=""
          title="YENİ KATEGORİ EKLE"
        />
      </div>
    );
  },
);

export default SearchFilter;
