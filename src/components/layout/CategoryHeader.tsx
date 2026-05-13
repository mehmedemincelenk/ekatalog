// FILE ROLE: Interactive Category Header for Product Grid (Diamond Standard)
// DEPENDS ON: QuickEditModal, THEME
import { memo, useRef, useCallback, useState } from 'react';
import { THEME, LABELS } from '../../data/config';
import { QuickEditModal } from '../modals/UtilityModals';
import { CategoryHeaderProps } from '../../types';

/**
 * CATEGORY HEADER (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Responsive and interactive header for category sections.
 * Supports long-press renaming for admins.
 */
const CategoryHeader = memo(
  ({
    categoryName,
    productCount,
    isAdmin,
    onRename,
    currentOrder,
  }: CategoryHeaderProps & { currentOrder?: number }) => {
    const theme = THEME.productGrid.header;
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

    // LONG PRESS LOGIC: Elegant way to trigger rename for admins
    const handlePointerDown = useCallback(() => {
      if (!isAdmin) return;
      longPressTimer.current = setTimeout(() => {
        setIsRenameModalOpen(true);
      }, 600); // Diamond Standard Long Press
    }, [isAdmin]);

    const handlePointerUp = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    return (
      <div 
        className={`${theme.wrapper} group relative select-none`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="flex items-center gap-3 shrink-0">
          <h2 className={`${theme.title} ${isAdmin ? 'cursor-edit' : ''}`}>
            {isAdmin && currentOrder !== undefined && (
              <span className="opacity-30 mr-1">{currentOrder}.</span>
            )}
            {categoryName}
          </h2>
        </div>

        <div className={theme.line}></div>

        <span className={theme.count}>
          {productCount} {LABELS.productCountSuffix}
        </span>

        {/* ADMIN RENAME MODAL */}
        <QuickEditModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          onSave={(newName) => {
            if (newName && newName.trim() && newName !== categoryName) {
              onRename(categoryName, newName.trim());
            }
          }}
          initialValue={categoryName}
          placeholder="Yeni kategori adı girin..."
        />
      </div>
    );
  }
);

export default CategoryHeader;
