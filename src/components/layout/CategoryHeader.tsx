// FILE ROLE: Interactive Category Header for Product Grid (Diamond Standard)
// DEPENDS ON: QuickEditModal, THEME
import { memo, useState } from 'react';
import * as Lucide from 'lucide-react';
import { THEME, LABELS } from '../../data/config';
import { QuickEditModal } from '../modals/UtilityModals';
import BaseModal from '../modals/BaseModal';
import Button from '../ui/Button';
import { CategoryHeaderProps } from '../../types';

/**
 * CATEGORY HEADER (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Responsive and interactive header for category sections.
 * Consolidates rename, ordering, and deletion controls.
 */
const CategoryHeader = memo(
  ({
    categoryName,
    productCount,
    isAdmin,
    onRename,
    onOrderChange,
    onDelete,
    currentOrder,
    totalCategories,
    isInlineEnabled,
  }: CategoryHeaderProps) => {
    const theme = THEME.productGrid.header;
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    return (
      <div
        className={`${theme.wrapper} group relative select-none flex items-center`}
      >
        <div className="flex items-center gap-2 shrink-0">
          {/* CATEGORY ORDER DROPDOWN BADGE */}
          {isAdmin &&
            currentOrder !== undefined &&
            totalCategories !== undefined && (
              <div
                className="relative z-30 inline-block pointer-events-auto shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <select
                    value={currentOrder}
                    onChange={async (e) => {
                      e.stopPropagation();
                      const newPos = Number(e.target.value);
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 1500);
                      try {
                        await onOrderChange?.(categoryName, newPos);
                      } catch {
                        setShowSuccess(false);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                  >
                    {Array.from({ length: totalCategories }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}.
                      </option>
                    ))}
                  </select>

                  <div
                    className={`
                  w-6 h-6 rounded-md flex items-center justify-center transition-all border border-stone-200/10 shadow-md backdrop-blur-sm
                  ${showSuccess ? 'bg-emerald-500' : 'bg-stone-900/60 hover:bg-stone-900/80'}
                `}
                  >
                    {showSuccess ? (
                      <Lucide.Check
                        size={10}
                        className="text-white"
                        strokeWidth={4}
                      />
                    ) : (
                      <span className="text-white text-[9px] font-black">
                        {currentOrder}.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* DELETE CATEGORY BUTTON */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="w-6 h-6 rounded-md flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-stone-100 transition-all cursor-pointer pointer-events-auto shrink-0"
              title="Kategoriyi Sil"
            >
              <Lucide.Trash2 size={12} strokeWidth={2.5} />
            </button>
          )}

          {/* CATEGORY TITLE */}
          <h2 className={`${theme.title} flex items-center gap-1.5`}>
            <span
              contentEditable={isAdmin && isInlineEnabled}
              suppressContentEditableWarning
              spellCheck={false}
              onBlur={(e) => {
                const newName = e.currentTarget.textContent?.trim();
                if (newName && newName !== categoryName) {
                  onRename(categoryName, newName);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onClick={() => {
                if (isAdmin && !isInlineEnabled) {
                  setIsRenameModalOpen(true);
                }
              }}
              className={`${isAdmin ? (isInlineEnabled ? 'outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text' : 'cursor-pointer hover:bg-stone-100/60 rounded px-1 -mx-1') : ''} !text-[10px] uppercase tracking-widest font-black`}
            >
              {categoryName}
            </span>
          </h2>
        </div>

        <div className="flex-1 h-px border-t border-dashed border-stone-300 mx-2"></div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`${theme.count} !text-[10px] font-black tracking-tight`}
          >
            {productCount} {LABELS.productCountSuffix}
          </span>
        </div>

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

        {/* ADMIN DELETE MODAL */}
        <BaseModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="KATEGORİYİ SİL"
          subtitle={`"${categoryName}" kategorisini silmek istediğinize emin misiniz?`}
        >
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs font-bold text-stone-500 leading-relaxed">
              {categoryName.trim().toLowerCase() === 'genel' ? (
                <>
                  Bu kategori silinirse altındaki <strong>tüm ürünler kalıcı olarak silinecektir</strong>.
                </>
              ) : (
                <>
                  Bu kategori altındaki ürünler otomatik olarak <strong>"Genel"</strong> kategorisine taşınacaktır.
                </>
              )}
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="secondary"
                className="flex-1 h-12"
              >
                İPTAL
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await onDelete?.(categoryName);
                  } catch (err) {
                    console.error('Delete category failed:', err);
                  } finally {
                    setIsDeleteModalOpen(false);
                  }
                }}
                variant="danger"
                className="flex-1 h-12"
              >
                SİL
              </Button>
            </div>
          </div>
        </BaseModal>
      </div>
    );
  },
);

export default CategoryHeader;
