/**
 * TYPES / INDEX.TS (VERİ ANAYASASI)
 * --------------------------------
 * Bu dosya mağazanın "Master Kontratıdır". Tüm veri yapıları burada mühürlenir.
 */

/**
 * Product: Tek bir ürünün sahip olması gereken tüm özellikler.
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image_url: string | null;
  original_image_url: string | null;
  polished_image_url: string | null;
  is_polished_pending: boolean;
  polished_ready_dismissed: boolean;
  text_polished_dismissed: boolean;
  suggested_name: string | null;
  suggested_description: string | null;
  out_of_stock: boolean;
  is_archived: boolean;
  sort_order: number;
  store_id: string;
  created_at?: string;
}

/**
 * CarouselSlide: Ana sayfadaki kayan görsellerin yapısı.
 */
export interface CarouselSlide {
  id: number;
  src: string;
  bg: string;
  label: string;
  sub: string;
}

/**
 * NewProductPayload: Yeni bir ürün oluşturulurken id ve arşiv durumu hariç gönderilen veri.
 */
export interface NewProductPayload {
  name: string;
  category: string;
  price: string;
  description: string;
  image_url: string | null;
  store_id: string;
  out_of_stock: boolean;
  is_archived: boolean;
}

/**
 * ActiveDiscount: Müşterinin şu an kullandığı promosyon bilgisi.
 */
export interface ActiveDiscount {
  code: string;
  rate: number;
  category?: string;
}

/**
 * Reference: Müşteri referans logoları.
 */
export interface Reference {
  id: number;
  name: string;
  logo: string;
}

/**
 * DisplayConfig: Mağazadaki bileşenlerin görünürlük ayarları.
 */
export interface DisplayConfig {
  showAddress: boolean;
  showInstagram: boolean;
  showWhatsapp: boolean;
  showReferences: boolean;
  showPrice: boolean;
  showCarousel: boolean;
  showCoupons: boolean;
  showPriceList: boolean;
  showCurrency: boolean;
  showSearch: boolean;
  showCategories: boolean;
  showLogo: boolean;
  showSubtitle: boolean;
  [key: string]: boolean | string | number | undefined | null;
}

/**
 * ProductDetailModalProps: Ürün detay modalının sahip olması gereken veri yapısı.
 */
export interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  isPromotionActive?: boolean;
  originalPriceLabel?: string;
  discountedPriceLabel?: string;
  highDefinitionImageSource: string;
  isStatic?: boolean;
}


/**
 * CompanySettings: Mağazanın kimlik, marka ve sistem ayarları.
 */
export interface CompanySettings {
  id: string;
  whatsapp: string;
  address: string;
  instagram: string;
  title: string;
  subtitle: string;
  name: string;
  logoUrl: string;
  categoryOrder: string[];
  carouselData: {
    slides: CarouselSlide[];
  };
  referencesData: Reference[];
  displayConfig: DisplayConfig;
  announcementBar: {
    enabled: boolean;
    text: string;
  };
  socialProofCards?: string[];
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
  visitor_leads?: unknown;
  exchangeRates: {
    usd: number;
    eur: number;
  };
  activeCurrency: 'TRY' | 'USD' | 'EUR';
  photoroomApiKey?: string;
  slug?: string;
}

/**
 * Category: Kategorilerin temel bilgisi.
 */
export interface Category {
  name: string;
  display_order: number;
}

export interface SmartImageProps {
  src: string | null;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'rectangle' | 'none';
  objectFit?: 'cover' | 'contain';
  fallbackIcon?: React.ReactNode;
  fallbackSrc?: string | null;
  priority?: boolean;
  rounded?: boolean;
}

export interface AddProductModalProps {
  isModalOpen: boolean;
  availableCategories: string[];
  onProductAddition: (productData: NewProductPayload, imageFile?: File) => void;
  onModalClose: () => void;
  initialCategory?: string;
  isStatic?: boolean;
  initialStep?: number;
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText: string;
  id: string;
}

export interface ProductImagePickerProps {
  imagePreviewUrl: string | null;
  onFileSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ProductCategorySelectorProps {
  categories: string[];
  currentSelection: string;
  customCategory: string;
  onCategorySelect: (category: string) => void;
  onCustomCategoryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Component Props: Dükkanın ana parçalarının iletişim protokolleri.
 */
export interface NavbarProps {
  onLogoPointerDown: () => void;
  onLogoPointerUp: () => void;
  isInlineEnabled: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'glass'
    | 'whatsapp'
    | 'kraft';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mode?: 'circle' | 'rectangle' | 'square';
  loading?: boolean;
}

export interface HelpInfo {
  title: string;
  onText: string;
  offText: string;
}

export interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  updateSetting: <K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K],
  ) => void;
  isInlineEnabled: boolean;
  onToggleInline: () => void;
  isStatic?: boolean;
  initialStep?: number;
}

export interface HeroCarouselProps {
  isAdminModeActive: boolean;
}

export interface FooterProps {
  onApplyDiscount?: (code: string) => void;
  discountError?: string | null;
}

export interface ProductCardProps {
  product: Product;
  categories: string[];
  isAdmin: boolean;
  isInlineEnabled: boolean;
  showPrice?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderChange?: (id: string, newPosition: number) => void;
  onOrderIndexChange?: (id: string, newIndex: number) => void;
  onImageUpload?: (id: string, file: File) => Promise<string | undefined>;
  orderIndex?: number;
  itemsInCategory?: number;
  activeDiscount?: ActiveDiscount | null;
  isPriority?: boolean;
  activeAdminProductId?: string | null;
  setActiveAdminProductId?: (id: string | null) => void;
  displayCurrency?: 'TRY' | 'USD' | 'EUR';
  exchangeRates?: { usd: number; eur: number };
}

export interface PlusPlaceholderProps {
  type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL';
  onClick: (data?: string) => void;
  category?: string;
  className?: string;
  label?: string;
}

export interface CategoryFilterChipProps {
  categoryName: string;
  isItemSelected: boolean;
  isAdminMode: boolean;
  productCount: number;
  onSelect: (categoryName: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onOrderChange?: (categoryName: string, newPosition: number) => void;
  orderIndex?: number;
  totalCategories?: number;
  showFingerprint?: boolean;
}

export interface CategoryHeaderProps {
  categoryName: string;
  productCount: number;
  isAdmin: boolean;
  onRename: (oldName: string, newName: string) => void;
  onOrderChange?: (categoryName: string, newPosition: number) => void;
  currentOrder?: number;
  totalCategories?: number;
}

export interface SearchFilterProps {
  sortedList: string[];
  stats: Record<string, number>;
  onCategoryOrderChange: (categoryName: string, newPosition: number) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;
  onAddCategory?: (name: string) => void;
}

export interface ProductGridProps {
  products: Product[];
  categoryOrder: string[];
  isInlineEnabled: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onOrderUpdate?: (id: string, newPosition: number) => Promise<void>;
  onOrderIndexChange?: (id: string, newIndex: number) => void;
  onImageUpload?: (id: string, file: File) => Promise<string | undefined>;
  visibleCategoryLimit: number;
  onLoadMore?: () => void;
  onAddClick?: (targetCategory?: string) => void;
  activeAdminProductId?: string | null;
  setActiveAdminProductId?: (id: string | null) => void;
  visitorCurrency?: 'TRY' | 'USD' | 'EUR';
  renameCategory: (oldName: string, newName: string) => void;
}

export interface SearchLog {
  timestamp: string;
  term: string;
}

export interface ProductAnalysis {
  name: string;
  description: string;
  categories: string[];
  vibe: string;
}

export interface ExchangeRates {
  usd: number;
  eur: number;
  lastUpdate?: number;
}

export interface StatusToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

export interface ProductCardUIProps {
  product: Product;
  nameOverride?: string;
  descriptionOverride?: string;
  isDimmed?: boolean;
  isHighlighted?: boolean;
  displayCurrency?: 'TRY' | 'USD' | 'EUR';
  exchangeRates?: { usd: number; eur: number };
  className?: string;
  labelOverride?: string;
}

export interface InfoHintProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export interface MarqueeTextProps {
  text: string;
  textClass: string;
  isAdmin: boolean;
  editableProps?: React.HTMLAttributes<HTMLDivElement>;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface EditProdCardProps {
  product: Product;
  categories: string[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onImageUpload?: (id: string, file: File) => Promise<string | undefined>;
  isStatic?: boolean;
  initialStep?: number;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'white';
  label?: string;
  className?: string;
}

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?:
    | 'max-w-sm'
    | 'max-w-md'
    | 'max-w-lg'
    | 'max-w-xl'
    | 'max-w-2xl'
    | 'max-w-4xl'
    | 'max-w-5xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  progress?: {
    current: number;
    total: number;
  };
  hideCloseButton?: boolean;
  disableClickOutside?: boolean;
  className?: string;
  noPadding?: boolean;
  isStatic?: boolean;
}

export interface PinModalProps {
  isModalOpen: boolean;
  onVerify: (pin: string) => Promise<boolean>;
  onAuthenticationSuccess: () => void;
  onModalClose: () => void;
  isLockedOut?: boolean;
  failedAttempts?: number;
  isStatic?: boolean;
  initialStep?: number;
}

export interface TurnstileProps {
  onVerify: (token: string) => void;
  options?: {
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'invisible';
  };
}

export interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'invisible';
}

export interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean;
}

export interface PriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  visitorCurrency: 'TRY' | 'USD' | 'EUR';
  exchangeRates?: { usd: number; eur: number };
  activeDiscount?: { rate: number; category?: string } | null;
  storeName: string;
  isStatic?: boolean;
  initialStep?: number;
}
export interface AppModalsProps {
  isAdmin: boolean;
  settings: CompanySettings | null;
  categoryOrder: string[];
  allProducts: Product[];

  // Modal States
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isBulkUpdateModalOpen: boolean;
  setIsBulkUpdateModalOpen: (open: boolean) => void;
  isDisplaySettingsOpen: boolean;
  setIsDisplaySettingsOpen: (open: boolean) => void;
  isQRModalOpen: boolean;
  setIsQRModalOpen: (open: boolean) => void;
  isPinModalOpen: boolean;
  setIsPinModalOpen: (open: boolean) => void;
  isCouponModalOpen: boolean;
  setIsCouponModalOpen: (open: boolean) => void;
  isPriceListModalOpen: boolean;
  setIsPriceListModalOpen: (open: boolean) => void;
  isGlobalAddMenuOpen: boolean;
  setIsGlobalAddMenuOpen: (open: boolean) => void;
  aiStudioProduct: Product | null;
  setAiStudioProduct: (product: Product | null) => void;
  pendingAddCategory?: string;
  setPendingAddCategory: (category?: string) => void;

  // Action Handlers
  addProduct: (data: unknown) => Promise<string | undefined>;
  uploadImage: (params: { id: string; file: File }) => Promise<string | void>;
  updateProduct: (params: { id: string; changes: Partial<Product> }) => void;
  updateSetting: (key: unknown, value: unknown) => void;
  executeGranularBulkActions: (actions: unknown) => Promise<void>;
  handleGlobalAddAction: (
    type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL',
  ) => void;

  // Admin / Auth Logic
  verifyPinWithServer: (pin: string) => Promise<boolean>;
  onPinSuccess: () => void;
  isLockedOut: boolean;
  failedAttempts: number;
  isInlineEnabled: boolean;
  toggleInlineEdit: () => void;

  // Marketing / Price Logic
  applyCode: (code: string) => void;
  activeDiscount: { rate: number; category?: string } | null;
  discountError: string | null;
  visitorCurrency: 'TRY' | 'USD' | 'EUR';
}

export interface MaintenancePageProps {
  onLogoPointerDown: () => void;
  onLogoPointerUp: () => void;
}

export interface GlobalAddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL') => void;
  isStatic?: boolean;
}

export interface FloatingGuestMenuProps {
  onCouponClick: () => void;
  onExcelClick: () => void;
  onSearchClick: () => void;
  onQRClick: () => void;
}

export interface FloatingAdminMenuProps {
  onProductAddTrigger: () => void;
  onBulkUpdateTrigger?: () => void;
  onSettingsTrigger: () => void;
}

export interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (code: string) => void;
  discountError?: string | null;
  activeDiscount?: { rate: number; category?: string } | null;
  isStatic?: boolean;
}

export interface CarouselSlideUnitProps {
  slideData: CarouselSlide;
  isCurrentlyActive: boolean;
  isAdmin: boolean;
  isCurrentlyUploading: boolean;
  editingTargetSlideId: number | null;
  isMobileView?: boolean;
  onImageUpdateTrigger: (slideId: number) => void;
  onDeleteTrigger: (slideId: number) => void;
  currentIndex: number;
  totalSlides: number;
}

export interface ReferencesProps {
  isAdmin?: boolean;
  isInlineEnabled?: boolean;
}

export interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  subtitle?: string;
  initialValue: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'tel' | 'url';
  isStatic?: boolean;
}

export interface OffHoursNoticeProps {
  forceVisible?: boolean;
}

export interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  categories: string[];
  onGranularUpdate: (
    actions: {
      productId: string;
      newPrice?: number;
      delete?: boolean;
      out_of_stock?: boolean;
      is_archived?: boolean;
    }[],
  ) => Promise<void>;
  isStatic?: boolean;
  initialStep?: number;
}

export type ModalType =
  | 'ADD_PRODUCT'
  | 'BULK_UPDATE'
  | 'NOTIFICATIONS'
  | 'DISPLAY_SETTINGS'
  | 'QR'
  | 'PIN'
  | 'COUPON'
  | 'PRICE_LIST'
  | 'GLOBAL_ADD_MENU'
  | 'AI_STUDIO_TEXT'
  | 'AI_STUDIO_COMPARE'
  | 'AI_STUDIO_BG'
  | 'LOCATION'
  | 'CONTACT'
  | 'SOCIAL_EXPORT'
  | null;

export interface StoreState {
  isAdmin: boolean;
  setIsAdmin: (status: boolean) => void;
  adminPin: string | null;
  setAdminPin: (pin: string | null) => void;
  settings: CompanySettings | null;
  setSettings: (settings: CompanySettings) => void;
  updateSetting: <K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K],
  ) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategories: string[];
  toggleCategory: (category: string) => void;
  clearCategories: () => void;
  // Currency & Rates
  visitorCurrency: 'TRY' | 'USD' | 'EUR';
  toggleVisitorCurrency: () => void;
  exchangeRates: { usd: number; eur: number } | null;
  setExchangeRates: (rates: { usd: number; eur: number }) => void;

  activeDiscount: { code: string; rate: number; category?: string } | null;
  setActiveDiscount: (
    discount: { code: string; rate: number; category?: string } | null,
  ) => void;
  discountError: string | null;
  applyDiscountCode: (code: string) => void;

  isInlineEnabled: boolean;
  toggleInlineEdit: () => void;

  // UI / Modal Management
  activeModal: ModalType;
  modalData: unknown;
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;

  // Workspace
  isWorkspaceOpen: boolean;
  toggleWorkspace: () => void;

  // Global Feedback
  feedbackStatus: 'success' | 'error' | 'idle';
  feedbackMessage: string;
  showFeedback: (
    type: 'success' | 'error' | 'idle',
    message?: string,
    duration?: number,
  ) => void;
  hideFeedback: () => void;
}

export interface AIStudioTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  suggestedName: string;
  suggestedDescription: string;
  onConfirm: (newName: string, newDesc: string) => void;
  onDismiss: () => void;
  displayCurrency?: 'TRY' | 'USD' | 'EUR';
  exchangeRates?: { usd: number; eur: number };
  isStatic?: boolean;
}

export interface AIStudioCompareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (productId: string, polishedUrl: string) => void;
  onDismiss: (productId: string) => void;
  isStatic?: boolean;
}
