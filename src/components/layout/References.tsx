import { useState, memo } from 'react';
import { THEME, REFERENCES } from '../../data/config';
import { useSettings } from '../../hooks/useSettingsHub';
import Button from '../ui/Button';
import PlusPlaceholder from '../ui/PlusPlaceholder';
import { QuickEditModal } from '../modals/UtilityModals';
import * as Lucide from 'lucide-react';

import { ReferencesProps, Reference } from '../../types';

/**
 * REFERENCE CARD (DIAMOND ATOM)
 * -----------------------------------------------------------
 * Internal sub-component to handle card-specific states like delete confirmation.
 */
const ReferenceCard = memo(({ 
  refData, 
  isAdmin, 
  isInlineEnabled, 
  onDelete, 
  onEdit 
}: { 
  refData: Reference; 
  isAdmin: boolean; 
  isInlineEnabled: boolean; 
  onDelete: (id: number) => void; 
  onEdit: (id: number, name: string) => void;
}) => {
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const referencesTheme = THEME.references;

  return (
    <div
      className={`${referencesTheme.card.base} relative group flex items-center justify-center p-4 text-center border-stone-100 bg-white shadow-[0_2px_15px_-5px_rgba(0,0,0,0.08)] hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 rounded-xl overflow-hidden`}
    >
      <span
        contentEditable={isAdmin && isInlineEnabled}
        suppressContentEditableWarning
        onBlur={(e) => {
          const newName = e.currentTarget.textContent || '';
          onEdit(refData.id, newName);
        }}
        onKeyDown={(e) =>
          e.key === 'Enter' &&
          (e.preventDefault(), e.currentTarget.blur())
        }
        onClick={() => !isInlineEnabled && onEdit(refData.id, refData.name)}
        className={`text-[12px] font-black uppercase tracking-[0.2em] text-stone-800 leading-tight outline-none ${isAdmin ? 'hover:bg-stone-50 focus:bg-stone-50 focus:ring-2 focus:ring-stone-900/10 px-3 py-1 -mx-3 rounded-xl transition-all cursor-text' : ''}`}
      >
        {refData.name}
      </span>

      {isAdmin && (
        <>
          {/* DELETE ACTIONS */}
          <div className="absolute top-2 right-2 z-20 flex gap-1">
            {!isDeleteConfirming ? (
              <Button
                onClick={() => setIsDeleteConfirming(true)}
                variant="danger"
                mode="circle"
                size="sm"
                icon={<Lucide.Trash2 size={14} />}
                className="!w-7 !h-7 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Referansı Sil"
              />
            ) : (
              <div className="flex gap-1 animate-in slide-in-from-right-2 duration-300">
                <Button
                  onClick={() => {
                    onDelete(refData.id);
                    setIsDeleteConfirming(false);
                  }}
                  variant="danger"
                  mode="circle"
                  size="sm"
                  icon={<Lucide.Check size={14} />}
                  className="!w-7 !h-7 shadow-lg"
                />
                <Button
                  onClick={() => setIsDeleteConfirming(false)}
                  variant="secondary"
                  mode="circle"
                  size="sm"
                  icon={<Lucide.X size={14} />}
                  className="!w-7 !h-7 shadow-lg"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default function References({
  isAdmin = false,
  isInlineEnabled = true,
}: ReferencesProps) {
  const { settings, updateSetting } = useSettings(isAdmin);
  const referencesTheme = THEME.references;

  const [activeQuickEdit, setActiveQuickEdit] = useState<{
    id: number;
    name: string;
    isNew?: boolean;
  } | null>(null);

  const activeReferences =
    settings.referencesData && settings.referencesData.length > 0
      ? settings.referencesData
      : isAdmin
        ? []
        : REFERENCES;

  const handleDelete = (id: number) => {
    const updated = activeReferences.filter((r) => r.id !== id);
    updateSetting('referencesData', updated);
  };

  const handleSaveEdit = (newName: string) => {
    if (!activeQuickEdit) return;

    if (activeQuickEdit.isNew) {
      if (newName.trim()) {
        updateSetting('referencesData', [
          ...activeReferences,
          { id: Date.now(), name: newName.trim(), logo: '' },
        ]);
      }
    } else {
      const updated = activeReferences.map((r) =>
        r.id === activeQuickEdit.id ? { ...r, name: newName } : r,
      );
      updateSetting('referencesData', updated);
    }
    setActiveQuickEdit(null);
  };

  return (
    <section className={`${referencesTheme.layout} !py-8`}>
      <div className={referencesTheme.container}>
        {/* CENTERED HEADER SECTION */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase leading-none">
            REFERANSLARIMIZ
          </h2>
          <div className="w-12 h-1 bg-stone-900 mt-4 mb-2 rounded-full opacity-10"></div>
        </div>

        <div className={referencesTheme.grid}>
          {activeReferences.map((ref) => (
            <ReferenceCard
              key={ref.id}
              refData={ref}
              isAdmin={isAdmin}
              isInlineEnabled={isInlineEnabled}
              onDelete={handleDelete}
              onEdit={(id, name) => setActiveQuickEdit({ id, name })}
            />
          ))}

          {isAdmin && (
            <PlusPlaceholder
              type="REFERENCE"
              onClick={() => setActiveQuickEdit({ id: 0, name: '', isNew: true })}
            />
          )}

          {isAdmin && activeReferences.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-stone-100 rounded-xl py-16 flex flex-col items-center justify-center gap-3 text-stone-300 bg-stone-50/50">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100 mb-2">
                <span className="text-xl">🤝</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center px-8 leading-loose opacity-60">
                HENÜZ REFERANS EKLENMEMİŞ
              </span>
              <p className="text-[9px] font-bold text-stone-400 italic">
                Sağ alttaki "+" butonuna basıp "Yeni Referans"ı seçin
              </p>
            </div>
          )}
        </div>
      </div>

      <QuickEditModal
        isOpen={!!activeQuickEdit}
        onClose={() => setActiveQuickEdit(null)}
        onSave={handleSaveEdit}
        initialValue={activeQuickEdit?.name || ''}
        placeholder="Referans adı..."
      />
    </section>
  );
}
