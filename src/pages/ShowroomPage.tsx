import { useState } from 'react';
import { Smartphone, Monitor, X, Check, Layout, Layers, Box, Package, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import Button from '../components/ui/Button';

// MODALS
import { 
  PinModal, 
  QRModal, 
  CouponModal, 
  LocationModal, 
  ContactModal,
  QuickEditModal,
  ProductDetailModal,
  GlobalAddMenuModal
} from '../components/modals/UtilityModals';
import DisplaySettingsModal from '../components/modals/DisplaySettingsModal';
import PriceListModal from '../components/modals/PriceListModal';

import AddProductModal from '../components/modals/AddProductModal';
import BulkPriceUpdateModal from '../components/modals/BulkPriceUpdateModal';



// LAYOUTS
import EditProdCard from '../components/layout/EditProdCard';

import ProductCard from '../components/layout/ProductCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroCarousel from '../components/layout/HeroCarousel';

// UI
import Numpad from '../components/ui/Numpad';
import StatusToggle from '../components/ui/StatusToggle';
import Badge from '../components/ui/Badge';
import StatusOverlay from '../components/ui/StatusOverlay';

// PAGES
import MaintenancePage from './MaintenancePage';

const MOCK_CATEGORIES = ['Kahveler', 'Tatlılar', 'Atıştırmalıklar'];

const MOCK_PRODUCT = {
  id: '1',
  name: 'Espresso Single',
  category: 'Kahveler',
  price: '45,00 ₺',
  description: 'Yoğun ve aromatik İtalyan kahvesi.',
  image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=200',
  out_of_stock: false,
  is_archived: false,
  sort_order: 1,
  store_id: 'mock',
  polished_image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=200',
  original_image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=200',
  is_polished_pending: false,
  polished_ready_dismissed: false,
  text_polished_dismissed: false,
  suggested_name: null,
  suggested_description: null,
};

const DocUnit = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <div className="absolute bottom-10 left-10 z-[100] pointer-events-none">
    <div className="flex items-center gap-3 bg-stone-900 text-white px-6 py-3 rounded-full border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
      {icon || <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />}
      <span className="text-[11px] font-black uppercase tracking-[0.4em]">{title}</span>
    </div>
  </div>
);

type ViewMode = 'mobile' | 'pc';

export default function ShowroomPage() {
  const { isWorkspaceOpen, toggleWorkspace, settings } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('pc');

  // STEP STATES
  const [addProductStep, setAddProductStep] = useState(1);
  const [bulkUpdateStep, setBulkUpdateStep] = useState(1);
  const [priceListStep, setPriceListStep] = useState(1);
  const [editProdStep, setEditProdStep] = useState(1);
  const [displaySettingsStep, setDisplaySettingsStep] = useState(1);
  const [pinStep, setPinStep] = useState(1);
  const [hiddenModals, setHiddenModals] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

  if (!isWorkspaceOpen) return null;

  const toggleModalVisibility = (id: string) => {
    setHiddenModals(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const phone = settings?.whatsapp || '05XX XXX XX XX';
  const storeName = settings?.title || 'DÜKKAN ADI';
  const address = settings?.address || 'ADRES BİLGİSİ';

  const featureModals = [

    { id: 'contact', title: 'İLETİŞİM HÜCRESİ', component: <ContactModal isOpen={true} onClose={() => toggleModalVisibility('contact')} phone={phone} storeName={storeName} isStatic={true} />, scale: 0.9 },
    { id: 'location', title: 'NAVİGASYON HÜCRESİ', component: <LocationModal isOpen={true} onClose={() => toggleModalVisibility('location')} address={address} isStatic={true} />, scale: 0.9 },
    { id: 'qr', title: 'PAYLAŞIM HÜCRESİ', component: <QRModal isOpen={true} onClose={() => toggleModalVisibility('qr')} isStatic={true} />, scale: 0.8 },
    { id: 'pin', title: 'GÜVENLİK HÜCRESİ', component: <PinModal isModalOpen={true} onVerify={async () => true} onAuthenticationSuccess={() => {}} onModalClose={() => toggleModalVisibility('pin')} isStatic={true} initialStep={pinStep} />, steps: [1, 2, 3], stepLabels: ['Pin', 'Captcha', 'Kilit'], currentStep: pinStep, setStep: setPinStep, scale: 0.8 },
    { id: 'add', title: 'ÜRETİM HÜCRESİ', component: <AddProductModal isModalOpen={true} onModalClose={() => toggleModalVisibility('add')} availableCategories={MOCK_CATEGORIES} onProductAddition={() => {}} isStatic={true} initialStep={addProductStep} />, steps: [1, 2, 3, 4, 5, 6, 7], stepLabels: ['Resim', 'İsim', 'Detay', 'Kategori', 'Fiyat', 'Stok', 'Önizleme'], currentStep: addProductStep, setStep: setAddProductStep, scale: 0.8 },
    { id: 'bulk', title: 'EKONOMİ HÜCRESİ', component: <BulkPriceUpdateModal isOpen={true} onClose={() => toggleModalVisibility('bulk')} allProducts={[MOCK_PRODUCT]} categories={MOCK_CATEGORIES} onGranularUpdate={async () => {}} isStatic={true} initialStep={bulkUpdateStep} />, steps: [0, 1, 2.1, 2.2, 2.3, 3], stepLabels: ['Seçim', 'İşlem', 'Kategori', 'Zam/İnd', 'Hesap', 'Onay'], currentStep: bulkUpdateStep, setStep: setBulkUpdateStep, scale: 0.7 },
    { id: 'display', title: 'GÖRÜNÜM HÜCRESİ', component: settings ? <DisplaySettingsModal isOpen={true} onClose={() => toggleModalVisibility('display')} settings={settings} updateSetting={() => {}} isInlineEnabled={true} onToggleInline={() => {}} isStatic={true} initialStep={displaySettingsStep} /> : null, steps: [1, 2, 3, 4], stepLabels: ['Ayar', 'Intro', 'H.Hızlı', 'H.Bakım'], currentStep: displaySettingsStep, setStep: setDisplaySettingsStep, scale: 0.8 },
    { id: 'coupon', title: 'PAZARLAMA HÜCRESİ', component: <CouponModal isOpen={true} onClose={() => toggleModalVisibility('coupon')} onApplyDiscount={() => {}} isStatic={true} />, scale: 0.9 },
    { id: 'price', title: 'İHRACAT HÜCRESİ', component: <PriceListModal isOpen={true} onClose={() => toggleModalVisibility('price')} products={[MOCK_PRODUCT]} categories={MOCK_CATEGORIES} visitorCurrency="TRY" storeName={storeName} isStatic={true} initialStep={priceListStep} />, steps: [0, 1, 2, 3, 4], stepLabels: ['Tanıtım', 'Ürünler', 'Katalog', 'Fiyatlar', 'İndir'], currentStep: priceListStep, setStep: setPriceListStep, scale: 0.6 },
    { id: 'global', title: 'KISAYOL HÜCRESİ', component: <GlobalAddMenuModal isOpen={true} onClose={() => toggleModalVisibility('global')} onAction={() => {}} isStatic={true} />, scale: 0.9 },
    { id: 'detail', title: 'VİTRİN HÜCRESİ', component: <ProductDetailModal isOpen={true} onClose={() => toggleModalVisibility('detail')} product={MOCK_PRODUCT} isStatic={true} isPromotionActive={false} originalPriceLabel="100 ₺" discountedPriceLabel={undefined} highDefinitionImageSource="" />, scale: 0.9 },
    { id: 'edit', title: 'YÖNETİM HÜCRESİ', component: <EditProdCard product={MOCK_PRODUCT} categories={MOCK_CATEGORIES} onDelete={() => {}} onUpdate={() => {}} isOpen={true} setIsOpen={() => toggleModalVisibility('edit')} isStatic={true} initialStep={editProdStep} />, steps: [1, 2, 3, 4], stepLabels: ['Edit', 'Sil Op.', 'S.Ürün', 'S.Resim'], currentStep: editProdStep, setStep: setEditProdStep, scale: 0.8 },
    { id: 'quick', title: 'SÜRAT HÜCRESİ', component: <QuickEditModal isOpen={true} onClose={() => toggleModalVisibility('quick')} onSave={() => {}} initialValue="150,00 ₺" isStatic={true} />, scale: 0.9 }
  ];

  const pageSections = [
    { id: 'maintenance', title: 'BAKIM SAYFASI', component: <MaintenancePage onLogoPointerDown={() => {}} onLogoPointerUp={() => {}} />, scale: 0.5, isSpecial: true },

  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA] flex flex-col font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-stone-900 text-white px-3 py-1.5 rounded-lg">
            <Layout size={18} />
            <span className="text-xs font-black tracking-tighter uppercase">Diamond Workspace</span>
          </div>
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
            Showroom Mode
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <Button
              onClick={() => setViewMode('mobile')}
              variant={viewMode === 'mobile' ? 'primary' : 'ghost'}
              className={`!h-9 !px-4 !rounded-lg !text-xs !font-bold transition-all shadow-none ${viewMode === 'mobile' ? '' : 'text-stone-400'}`}
              icon={<Smartphone size={14} />}
            >
              Mobil
            </Button>
            <Button
              onClick={() => setViewMode('pc')}
              variant={viewMode === 'pc' ? 'primary' : 'ghost'}
              className={`!h-9 !px-4 !rounded-lg !text-xs !font-bold transition-all shadow-none ${viewMode === 'pc' ? '' : 'text-stone-400'}`}
              icon={<Monitor size={14} />}
            >
              Desktop
            </Button>
          </div>
          <div className="w-px h-6 bg-stone-200 mx-2" />
          <Button onClick={toggleWorkspace} variant="secondary" mode="circle" size="sm" icon={<X size={18} />} className="!bg-stone-100 border-none" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-12 custom-scrollbar bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-32 pb-40">
          
          {/* SECTION 1: DESIGN SYSTEM ATOMS */}
          <section className="flex flex-col gap-12">
            <div className="flex items-center gap-4 border-b-2 border-stone-900 pb-4">
              <Box className="text-stone-900" size={24} />
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Diamond Atomic System</h2>
            </div>

            <div className="grid grid-cols-1 gap-16">
              {/* BUTTONS */}
              <div className="space-y-12 p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100">
                <div>
                  <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2">Master Atomic Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="glass">Glass</Button>
                    <Button variant="whatsapp">WhatsApp</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="kraft">Kraft</Button>
                    <Button variant="instagram">Instagram</Button>
                    <Button variant="phone">Phone</Button>
                    <Button variant="action" icon={<Check size={18} />}>Action</Button>
                    <Button variant="action" icon={<Check size={20} strokeWidth={4} />} showFingerprint={true} className="!h-16 !px-8">Diamond Seal</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2">Exhaustive System Audit (Tüm Butonlar)</h3>
                  <div className="grid grid-cols-1 gap-12">
                    
                    {/* CATEGORY: NAVIGATION & BRAND */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-stone-900 pl-3">
                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Navbar & Header</span>
                      </div>
                      <div className="space-y-3 bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                        <div className="flex flex-col gap-2">
                           <Button variant="primary" className="!bg-stone-900 !text-white !px-3 !h-9 !rounded-lg"><span className="text-[10px] font-black">SİPARİŞ VER</span></Button>
                           <span className="text-[9px] font-bold text-stone-400">Varyant: Primary (Order Action)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="ghost" mode="square" size="sm" className="!w-8 !h-8 !p-0 !bg-transparent text-stone-400"><Layout size={18} /></Button>
                           <span className="text-[9px] font-bold text-stone-400">Varyant: Ghost (Social Icon)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="ghost" mode="circle" size="sm" className="!w-6 !h-6 !p-0 !bg-transparent text-white/80"><X size={12} /></Button>
                           <span className="text-[9px] font-bold text-stone-400">Varyant: Ghost (Banner Dismiss)</span>
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY: FLOATING MENUS (GUEST) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-amber-400 pl-3">
                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Floating Menus (Guest)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                        <div className="flex flex-col gap-2">
                           <Button variant="secondary" mode="circle" className="w-10 h-10"><Box size={18} /></Button>
                           <span className="text-[8px] font-bold text-stone-400 uppercase">Secondary (List)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="secondary" mode="circle" className="w-10 h-10"><Package size={18} /></Button>
                           <span className="text-[8px] font-bold text-stone-400 uppercase">Secondary (Coupon)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="kraft" mode="circle" className="w-10 h-10"><Layout size={18} /></Button>
                           <span className="text-[8px] font-bold text-stone-400 uppercase">Kraft (Location)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="whatsapp" mode="circle" className="w-10 h-10"><Package size={18} /></Button>
                           <span className="text-[8px] font-bold text-stone-400 uppercase">WhatsApp (Chat)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="instagram" mode="circle" className="w-10 h-10"><Layout size={18} /></Button>
                           <span className="text-[8px] font-bold text-stone-400 uppercase">Instagram (Profile)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="phone" mode="circle" className="w-10 h-10"><Package size={18} /></Button>
                           <span className="text-[8px] font-bold text-stone-400 uppercase">Phone (Call)</span>
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY: FLOATING MENUS (ADMIN) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Floating Menus (Admin)</span>
                      </div>
                      <div className="space-y-4 bg-stone-900 p-6 rounded-[2rem] border border-stone-800 shadow-xl">
                        <div className="flex flex-col gap-2">
                           <Button variant="primary" className="!bg-stone-900 !text-white w-full !rounded-xl !h-10 !border-white/10 border"><span className="text-[10px] font-black uppercase">TOPLU İŞLEM</span></Button>
                           <span className="text-[9px] font-bold text-stone-500">Varyant: Primary (Bulk Action)</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-2">
                             <Button variant="secondary" mode="circle" className="w-12 h-12 !bg-emerald-500 !text-white border-none"><Check size={24} /></Button>
                             <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Primary (Add)</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                             <Button variant="secondary" mode="circle" className="w-12 h-12 bg-white text-stone-900 border-2 border-stone-100"><Box size={24} /></Button>
                             <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Sec (Settings)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY: MODAL CONTROLS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Modal & Form Actions</span>
                      </div>
                      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                        <div className="flex gap-3">
                           <div className="flex flex-col gap-2 flex-1">
                              <Button variant="action" showFingerprint={true} className="w-full h-14 !rounded-2xl"><span className="text-[10px] font-black">TAMAM</span></Button>
                              <span className="text-[8px] font-bold text-stone-400">Varyant: Action (Submit)</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <Button variant="secondary" mode="rectangle" className="w-14 h-14 !rounded-2xl"><Check size={20} /></Button>
                              <span className="text-[8px] font-bold text-stone-400">Varyant: Sec (Back)</span>
                           </div>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="danger" className="w-full !rounded-2xl h-12 shadow-none"><span className="text-[10px] font-black">ÜRÜNÜ SİL</span></Button>
                           <span className="text-[8px] font-bold text-stone-400">Varyant: Danger (Delete)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="ghost" className="w-full h-10 border-dashed border-2 border-stone-100 !text-stone-300"><span className="text-[9px] font-black">İPTAL ET</span></Button>
                           <span className="text-[8px] font-bold text-stone-400">Varyant: Ghost (Cancel)</span>
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY: CAROUSEL & CARDS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-stone-300 pl-3">
                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Carousel & Cards</span>
                      </div>
                      <div className="space-y-4 bg-stone-50 p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                        <div className="flex gap-2">
                           <div className="flex flex-col gap-2">
                              <Button variant="glass" mode="circle" className="w-10 h-10"><Check size={16} /></Button>
                              <span className="text-[8px] font-bold text-stone-400 uppercase">Glass (Nav)</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <Button variant="danger" mode="circle" className="w-10 h-10"><Box size={16} /></Button>
                              <span className="text-[8px] font-bold text-stone-400 uppercase">Danger (Card Sil)</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY: UTILITIES */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-4 border-stone-200 pl-3">
                        <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest">Utilities & Info</span>
                      </div>
                      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                        <div className="flex flex-col gap-2">
                           <Button variant="ghost" mode="circle" size="sm" className="w-8 h-8"><Layout size={14} /></Button>
                           <span className="text-[8px] font-bold text-stone-400">Varyant: Ghost (Help Trigger)</span>
                        </div>
                        <div className="flex flex-col gap-2">
                           <Button variant="secondary" className="px-5 py-2.5 !rounded-xl border-stone-200 border-dashed border-2 text-stone-400"><span className="text-[9px] font-black">+ DAHA FAZLA</span></Button>
                           <span className="text-[8px] font-bold text-stone-400">Varyant: Sec (Show More)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* CHIPS & SELECTORS */}
              <div className="space-y-8 p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100">
                <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-4">Category Chips</h3>
                <div className="flex flex-wrap gap-2 p-6 bg-white rounded-3xl border border-stone-200">
                  {MOCK_CATEGORIES.map(cat => (
                    <Button key={cat} variant="secondary" className="!h-10 !px-4 !rounded-xl" mode="rectangle">
                      <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* BADGES & DOTS */}
              <div className="space-y-8 p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100">
                <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-4">Badges & Status Dots</h3>
                <div className="flex flex-col gap-6">
                   <div className="flex flex-wrap gap-3">
                     <Badge variant="primary">New</Badge>
                     <Badge variant="secondary">Original</Badge>
                     <Badge variant="warning">Advice</Badge>
                     <Badge variant="danger">Sold Out</Badge>
                     <Badge variant="success">Active</Badge>
                   </div>
                   <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-stone-200">
                     <div className="flex items-center gap-2">
                       <Badge variant="success" showDot={true} pulse={true} size="xs" />
                       <span className="text-[10px] font-bold">Online</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge variant="danger" showDot={true} size="xs" />
                       <span className="text-[10px] font-bold">Offline</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge variant="warning" showDot={true} pulse={true} size="xs" />
                       <span className="text-[10px] font-bold">Syncing</span>
                     </div>
                   </div>
                </div>
              </div>

              {/* INTERACTIVE ATOMS */}
              <div className="space-y-8 p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100">
                <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-4">Interactive Atoms</h3>
                <div className="grid grid-cols-1 gap-12">
                   <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Numpad Console</span>
                      <Numpad onSubmit={() => {}} title="Test Numpad" />
                   </div>
                   <div className="flex flex-col items-center justify-center gap-8 bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Diamond Master Toggles</span>
                      <div className="grid grid-cols-1 gap-4 w-full max-w-[300px]">
                         <StatusToggle label="Stok Durumu" value={true} onChange={() => {}} />
                         <StatusToggle label="Yayına Al" value={false} onChange={() => {}} />
                         <StatusToggle label="Katalog Görünümü" value={true} onChange={() => {}} />
                         <StatusToggle label="Bakım Modu" value={false} onChange={() => {}} />
                      </div>
                   </div>
                   <div className="flex flex-col items-center justify-center gap-8 bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Diamond Status Overlay (Feedback)</span>
                      <div className="flex flex-wrap gap-4">
                         <Button onClick={() => { setTestStatus('success'); setTimeout(() => setTestStatus('idle'), 2000); }} variant="success">Test Success</Button>
                         <Button onClick={() => { setTestStatus('error'); setTimeout(() => setTestStatus('idle'), 2000); }} variant="danger">Test Error</Button>
                         <Button onClick={() => { setTestStatus('loading'); setTimeout(() => setTestStatus('idle'), 2000); }} variant="primary">Test Loading</Button>
                      </div>
                      <div className="relative w-full h-[200px] bg-stone-100 rounded-3xl overflow-hidden border border-dashed border-stone-300 flex items-center justify-center">
                         <span className="text-[10px] font-bold text-stone-400 uppercase">Overlay Container Preview</span>
                         <StatusOverlay status={testStatus} message={testStatus === 'success' ? 'BAŞARILI' : testStatus === 'error' ? 'HATA OLUŞTU' : 'YÜKLENİYOR...'} />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: HERO COMPONENTS */}
          <section className="flex flex-col gap-12">
            <div className="flex items-center gap-4 border-b-2 border-stone-900 pb-4">
              <Sparkles className="text-stone-900" size={24} />
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Hero & Media Components</h2>
            </div>
            <div className="grid grid-cols-1 gap-12">
               <div className="space-y-6">
                 <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest pl-2">Hero Carousel (User & Admin Variants)</h3>
                 <div className="grid grid-cols-1 gap-16">
                   <div className="space-y-4">
                     <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Guest View (Infinite Loop & Swipe)</span>
                     <div className="border-8 border-stone-100 rounded-[3rem] overflow-hidden shadow-2xl bg-white">
                        <HeroCarousel isAdminModeActive={false} />
                     </div>
                   </div>
                   <div className="space-y-4">
                     <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Admin View (Management & Upload)</span>
                     <div className="border-8 border-stone-900 rounded-[3rem] overflow-hidden shadow-2xl bg-white">
                        <HeroCarousel isAdminModeActive={true} />
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </section>

          {/* SECTION 2: CATALOG CORE (PRODUCT CARD & NAVBAR) */}
          <section className="flex flex-col gap-12">
            <div className="flex items-center gap-4 border-b-2 border-stone-900 pb-4">
              <Package className="text-stone-900" size={24} />
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Catalog Core Components</h2>
            </div>

            <div className="grid grid-cols-1 gap-20">
              {/* NAVBAR PREVIEW */}
              <div className="space-y-6">
                 <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest pl-2">Navbar Architecture</h3>
                 <div className="border-8 border-stone-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <Navbar onLogoPointerDown={() => {}} onLogoPointerUp={() => {}} isInlineEnabled={false} />
                 </div>
              </div>

              {/* PRODUCT CARDS */}
              <div className="space-y-6">
                 <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest pl-2">Product Card Variations</h3>
                 <div className="grid grid-cols-1 gap-8">
                    <div className="p-4 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex flex-col items-center gap-4">
                       <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Normal View</span>
                       <ProductCard 
                         product={MOCK_PRODUCT} 
                         categories={MOCK_CATEGORIES}
                         isAdmin={false}
                         isInlineEnabled={false}
                         onDelete={() => {}}
                         onUpdate={() => {}}
                       />
                    </div>
                    <div className="p-4 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex flex-col items-center gap-4">
                       <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Out of Stock</span>
                       <ProductCard 
                         product={{...MOCK_PRODUCT, out_of_stock: true}} 
                         categories={MOCK_CATEGORIES}
                         isAdmin={false}
                         isInlineEnabled={false}
                         onDelete={() => {}}
                         onUpdate={() => {}}
                       />
                    </div>
                    <div className="p-4 bg-stone-900 rounded-[2.5rem] border border-stone-800 flex flex-col items-center gap-4">
                       <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Admin Layout (Edit Card)</span>
                       <div className="scale-90 origin-top">
                          <EditProdCard product={MOCK_PRODUCT} categories={MOCK_CATEGORIES} onDelete={() => {}} onUpdate={() => {}} isOpen={true} setIsOpen={() => {}} isStatic={true} />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: DIAMOND FEATURE MODALS */}
          <section className="flex flex-col gap-12">
            <div className="flex items-center gap-4 border-b-2 border-stone-900 pb-4">
              <Layers className="text-stone-900" size={24} />
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Diamond Feature Modals</h2>
            </div>

            <div className="flex flex-col items-center gap-32">
              {featureModals.map((item) => (
                <div key={item.id} className={`flex flex-col items-center gap-8 w-full transition-all duration-700 ${hiddenModals.includes(item.id) ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                  {item.steps && (
                    <div className="flex flex-wrap justify-center gap-2 bg-stone-100 p-1.5 rounded-2xl shadow-inner max-w-full">
                      {item.steps.map((s, idx) => (
                        <Button 
                          key={s} 
                          onClick={() => item.setStep?.(s)}
                          variant={item.currentStep === s ? 'primary' : 'ghost'}
                          className={`!px-4 !h-10 !rounded-xl !text-[10px] transition-all !uppercase !tracking-widest ${item.currentStep === s ? 'shadow-xl scale-105 !bg-stone-900 !text-white' : 'text-stone-400'}`}
                        >
                          {item.stepLabels ? item.stepLabels[idx] : `Step ${s}`}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className={`relative transition-all duration-500 border-4 border-stone-100 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-white overflow-hidden ${viewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-[1100px] h-[650px]'}`}>
                    <DocUnit title={item.title} />
                    <div className="w-full h-full relative overflow-auto p-12 flex items-center justify-center bg-stone-50/20">
                      <div className="transform-gpu" style={{ transform: `scale(${viewMode === 'mobile' ? item.scale : item.scale + 0.1})` }}>
                        {item.component}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: FULL PAGE EXPERIENCES */}
          <section className="flex flex-col gap-12">
            <div className="flex items-center gap-4 border-b-2 border-stone-900 pb-4">
              <Monitor className="text-stone-900" size={24} />
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Full Page Experiences</h2>
            </div>

            <div className="flex flex-col items-center gap-24">
              {pageSections.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-6 w-full">
                  <div className={`relative transition-all duration-500 border-4 border-stone-100 rounded-[3rem] shadow-2xl bg-white overflow-hidden ${viewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-[1000px] h-[600px]'}`}>
                    <DocUnit title={item.title} />
                    <div className={`w-full h-full relative overflow-auto ${item.id === 'maintenance' ? '' : 'p-10'} flex items-center justify-center bg-stone-50/50`}>
                      <div className={`transform-gpu ${item.id === 'maintenance' ? 'scale-[0.5] origin-top h-full w-full' : ''}`} style={!item.isSpecial ? { transform: `scale(${item.scale})` } : {}}>
                        {item.component}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
