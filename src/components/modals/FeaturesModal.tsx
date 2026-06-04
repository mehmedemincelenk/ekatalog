import * as Lucide from 'lucide-react';
import BaseModal from './BaseModal';
import { useStore } from '../../store';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureItem {
  id: 'SOCIAL_EXPORT' | 'PORTFOYS_SEARCH' | 'PORTFOYS_DIRECTORY';
  title: string;
  description: string;
  icon: keyof typeof Lucide;
  colorClass: string;
  iconColorClass: string;
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'SOCIAL_EXPORT',
    title: 'Sosyal Medya Tasarımı',
    description:
      'Ürünlerinizi paylaşmak için şık vitrin görselleri hazırlayın.',
    icon: 'Sparkles',
    colorClass: 'bg-amber-500/10',
    iconColorClass: 'text-amber-600',
  },
  {
    id: 'PORTFOYS_DIRECTORY',
    title: 'eKatalog Rehberim',
    description: 'B2B müşteri bulucu ve kayıtlı kurumsal toptancı rehberi.',
    icon: 'Users',
    colorClass: 'bg-blue-500/10',
    iconColorClass: 'text-blue-600',
  },
];

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  const { openModal } = useStore();

  const handleFeatureClick = (
    targetModal: 'SOCIAL_EXPORT' | 'PORTFOYS_SEARCH' | 'PORTFOYS_DIRECTORY',
  ) => {
    onClose();
    setTimeout(() => {
      openModal(targetModal);
    }, 150);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dükkan Özellikleri"
      subtitle="Satışlarınızı artıracak ve işinizi büyütecek özel araçlar"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-3 p-5">
        {FEATURE_ITEMS.map((item) => {
          const IconComponent = Lucide[item.icon] as React.ComponentType<{
            size?: number;
            strokeWidth?: number;
            className?: string;
          }>;
          return (
            <button
              key={item.id}
              onClick={() => handleFeatureClick(item.id)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-400 hover:shadow-md transition-all duration-200 text-left active:scale-98 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.colorClass} ${item.iconColorClass} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                {IconComponent && <IconComponent size={24} strokeWidth={2} />}
              </div>
              <div className="flex-1">
                <h4 className="text-[12px] font-black text-stone-900 uppercase tracking-wider">
                  {item.title}
                </h4>
                <p className="text-[10px] font-bold text-stone-400 mt-1 leading-normal">
                  {item.description}
                </p>
              </div>
              <Lucide.ChevronRight
                size={18}
                className="text-stone-300 group-hover:translate-x-1 transition-transform"
              />
            </button>
          );
        })}
      </div>
    </BaseModal>
  );
}
