/**
 * BASE DESIGN TOKENS
 */
const BR = {
  low: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

const FS = {
  xs: 'text-[0.5rem] leading-tight font-medium uppercase tracking-wider',
  sm: 'text-[0.5625rem] leading-snug font-semibold',
  base: 'text-[0.6875rem] leading-normal font-bold',
  lg: 'text-sm leading-tight font-black tracking-tight',
  xl: 'text-lg leading-none font-black tracking-tighter',
};

import {
  GripHorizontal,
  ChevronLeft,
  X,
  Search,
  Lock,
  Delete,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Power,
  Plus,
  Check,
  Settings,
  Settings2,
  Tags,
  Trash2,
  Diamond,
  Sparkles,
} from 'lucide-react';

export const THEME = {
  radius: {
    card: 'rounded-[var(--radius-card)]',
    button: 'rounded-[var(--radius-button)]',
    image: `rounded-t-lg`,
    modal: BR.lg,
    badge: 'rounded-[var(--radius-badge)]',
    input: BR.low,
    logo: BR.md,
    reference: BR.md,
    chip: BR.full,
    carousel: BR.md,
    checkbox: 'rounded-[0.2rem]',
  },

  font: FS,

  colors: {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)',
    danger:
      'text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white',
    success:
      'text-green-700 bg-green-50 border-green-100 hover:bg-green-600 hover:text-white',
    adminEdit: 'bg-amber-50/50 border-amber-200',
    adminHighlight: 'focus:bg-white/20 focus:outline-none',
    visualFallback: '#FFFFFF',
    marketing: {
      primary: '#16a34a', // green-600
      secondary: '#dc2626', // red-600
      brand: '#000000', // stone-900
    }
  },

  announcementBar: {
    wrapper:
      'w-full bg-[var(--primary)] text-white py-1 px-4 text-center relative',
    text: 'text-[0.5rem] font-bold uppercase tracking-[0.15em] leading-tight',
    closeButton:
      'absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer p-1',
    adminEditStyle:
      'outline-none focus:ring-0 cursor-text hover:bg-white/10 rounded px-1 transition-colors',
  },

  typography: {
    marquee: {
      container: 'overflow-hidden whitespace-nowrap',
      adminMode: 'whitespace-normal',
      track: 'marquee-track inline-block',
    },
  },

  icons: {
    dots: <GripHorizontal className="w-full h-full" strokeWidth={2.5} />,
    back: <ChevronLeft className="w-4 h-4" strokeWidth={3} />,
    close: <X className="w-5 h-5" strokeWidth={2.5} />,
    whatsapp: (
      <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.506-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.648h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    search: <Search className="w-full h-full" strokeWidth={2} />,
    lock: (
      <Lock className="w-full h-full" fill="currentColor" strokeWidth={0} />
    ),
    backspace: (
      <Delete className="w-full h-full" fill="currentColor" strokeWidth={1.5} />
    ),
    chevronLeft: <ChevronLeft className="w-full h-full" strokeWidth={2.5} />,
    chevronRight: <ChevronRight className="w-full h-full" strokeWidth={2.5} />,
    chevronDown: <ChevronDown className="w-full h-full" strokeWidth={2.5} />,
    chevronUp: <ChevronUp className="w-full h-full" strokeWidth={2.5} />,
    power: <Power className="w-full h-full p-0.5" strokeWidth={3} />,
    plus: <Plus className="w-full h-full p-0.5" strokeWidth={3} />,
    check: <Check className="w-full h-full" strokeWidth={3} />,
    adminLayout: <Settings className="w-full h-full p-0.5" strokeWidth={2.5} />,
    settings: <Settings2 className="w-full h-full p-0.5" strokeWidth={2.5} />,
    bulkPrice: <Tags className="w-full h-full p-0.5" strokeWidth={2.5} />,
    trash: <Trash2 className="w-full h-full p-0.5" strokeWidth={2.5} />,
    diamond: (
      <Diamond
        className="w-full h-full p-0.5"
        fill="currentColor"
        strokeWidth={2}
      />
    ),
    ai: <Sparkles className="w-full h-full p-1.5" strokeWidth={2.2} />,
  },

  shadows: {
    sm: 'shadow-[0_2px_15px_-5px_rgba(0,0,0,0.08)]',
    md: 'shadow-[0_10px_30px_rgba(0,0,0,0.1)]',
    lg: 'shadow-[0_20px_50px_rgba(0,0,0,0.15)]',
    xl: 'shadow-[0_20px_60px_rgba(0,0,0,0.3)]',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    inner: 'shadow-inner',
  },

  statusState: {
    success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
    active: 'bg-stone-900 text-white shadow-lg shadow-stone-900/20',
    inactive: 'bg-stone-100 text-stone-400 hover:text-stone-600',
    neutral: 'bg-white text-stone-900 shadow-sm border-stone-200',
  },

  button: {
    base: 'flex items-center justify-center border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none font-black uppercase tracking-widest',
    variants: {
      primary:
        'bg-[var(--primary)] text-white border-transparent shadow-xl hover:bg-[var(--primary-hover)] transition-standard',
      secondary:
        'bg-white text-[var(--primary)] border-[var(--secondary)] shadow-lg hover:bg-[var(--secondary)] transition-standard',
      success:
        'bg-green-50 text-green-700 border-green-100 shadow-md hover:bg-green-600 hover:text-white',
      kraft:
        'bg-kraft-600 text-white border-kraft-700 shadow-xl hover:bg-kraft-700',
      glass:
        'bg-white/40 backdrop-blur-md text-stone-900 border-white/20 hover:bg-white shadow-xl transition-standard',
      danger:
        'bg-red-500/90 text-white backdrop-blur-md border-white/20 hover:bg-red-600 shadow-xl',
      ghost:
        'bg-transparent text-stone-500 border-transparent hover:bg-stone-100 shadow-none',
      whatsapp: `bg-[var(--primary)] text-white rounded-[var(--radius-button)] transition-all active:scale-95 shadow-sm hover:bg-black`,
      outline:
        'bg-white text-stone-900 border-stone-200 hover:border-stone-900 shadow-sm transition-standard',
    },
    sizes: {
      circle: {
        xs: 'w-6 h-6',
        sm: 'w-9 h-9',
        md: 'w-11 h-11',
        lg: 'w-14 h-14',
      },
      square: {
        xs: 'w-7 h-7 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
      },
      rectangle: {
        xs: 'px-2 py-1 text-[9px]',
        sm: 'px-4 py-2 text-[11px]',
        md: 'px-6 py-3 text-xs',
        lg: 'px-8 py-4 text-sm',
      },
    },
  },

  navbar: {
    layout:
      'bg-white/80 backdrop-blur-xl border-b border-stone-100 sticky top-0 z-[100] w-full min-h-0 py-2',
    container: 'w-full px-2 h-full flex items-center',
    innerWrapper: 'flex justify-between items-center w-full',
    brand: {
      wrapper: 'flex items-center gap-1.5 shrink-0',
      logoWrapper:
        'flex items-center justify-center transition-all active:scale-90',
      logoImg:
        'w-10 h-10 object-contain rounded-[0.375rem]',
      logoText: FS.xl.replace('font-black', 'font-normal'),
      textWrapper: 'flex flex-col leading-tight',
      name: `${FS.base} tracking-tighter font-black text-stone-800`,
      tagline: `${FS.xs} text-stone-400 font-medium`,
      adminBadge: `ml-1 ${FS.xs} bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 ${BR.low}`,
      editHighlight: `cursor-pointer hover:bg-stone-100 ${BR.low} px-1 transition-colors`,
    },
    contact: {
      wrapper: 'flex items-center shrink-0 min-w-0 gap-1.5',
      address:
        'hidden text-[0.4rem] text-stone-500 hover:text-stone-900 transition-colors whitespace-nowrap truncate max-w-[9.375rem] px-1',
      mobileAddress:
        'block text-[0.45rem] text-stone-600 font-bold truncate max-w-[5.5rem]',
      mapUrlBase: 'https://www.google.com/maps/search/?api=1&query=',
      separator: 'hidden w-px h-2.5 bg-stone-200',
      actions: 'flex items-center gap-1',
      instagram:
        'text-stone-400 hover:text-pink-600 transition-all active:scale-75 cursor-pointer',
      instagramIconSize: 'w-3.5 h-3.5',
      phoneText: `text-[0.45rem] font-black tracking-tight text-white`,
      phoneBtnRadius: BR.md,
    },
  },

  floatingAdminMenu: {
    wrapper:
      'fixed bottom-2 right-2 z-[150]',
    container: `flex flex-col items-center p-1 bg-stone-200/50 backdrop-blur-xl border border-white/20 shadow-2xl ${BR.full}`,
    innerActions: 'flex flex-col gap-1.5 overflow-hidden',
    actionsActive: 'max-h-64 opacity-100 mt-1 mb-2',
    actionsInactive: 'max-h-0 opacity-0',
    toggleActive:
      '!bg-stone-900/10 !text-stone-900 shadow-none border-transparent',
    toggleInactive: 'shadow-sm',
  },

  heroCarousel: {
    layout: `relative w-full group/carousel overflow-hidden ${BR.md} aspect-[16/9]`,
    container: 'max-w-7xl mx-auto px-4 mt-6',
    slide: {
      base: 'absolute inset-0 transition-opacity duration-700 ease-in-out',
      image: 'absolute inset-0 w-full h-full object-cover',
      placeholderBg: 'bg-stone-200',
      overlay:
        'absolute inset-0 z-30 flex items-center justify-center bg-black/10',
      loadingSpinner:
        'w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin',
      loadingBlur: 'opacity-50 blur-sm',
      changeBadge: `absolute top-4 left-4 z-30 pointer-events-auto bg-stone-900 text-white px-3 py-1.5 rounded-[var(--radius-button)] ${FS.xs} font-black shadow-xl`,
    },
    navigation: {
      navBtnStyle: 'opacity-100 flex',
      prevPos: 'left-4',
      nextPos: 'right-4',
      dotsWrapper:
        'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10',
      dotBase: `w-1.5 h-1.5 ${BR.full} transition-all duration-300`,
      dotActive: 'bg-white w-4',
      dotInactive: 'bg-white/30',
    },
  },

  searchFilter: {
    layout:
      'bg-white border-b border-stone-200 py-3 relative sticky top-[56px] z-40',
    container:
      'max-w-7xl mx-auto px-4 flex flex-col items-start gap-3',
    searchArea: {
      wrapper:
        'flex w-full items-center gap-2 shrink-0 flex-wrap',
      inputWrapper: `relative flex-1 min-w-[140px] ${BR.low}`,
      iconSize:
        'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400',
      input: `w-full pl-9 pr-8 py-2 border border-stone-200 ${FS.sm} text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none transition-colors duration-200 bg-stone-50/50 ${BR.low} motion-fix`,
      clearButton:
        'absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 p-1 transition-colors',
      mobileToggle: ` flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 border border-stone-200 ${FS.xs} font-black text-stone-700 ${BR.low}`,
    },
    categoryList: {
      wrapper: 'flex flex-wrap gap-2 items-center flex-1 transition-all w-full',
      chip: {
        container: `flex items-stretch overflow-hidden border transition-all duration-300 ${BR.full}`,
        active: 'bg-stone-900 text-white border-stone-900 shadow-md scale-102',
        activeText: 'text-white',
        inactive:
          'bg-white text-stone-600 border-stone-200 hover:border-stone-400 active:scale-98',
        inactiveText: 'text-stone-600',
        counter: {
          base: `${FS.xs} font-black w-7 h-7 flex items-center justify-center shrink-0 transition-colors`,
          active: 'bg-white/20 text-white',
          inactive: 'bg-stone-50 text-stone-400 border-r border-stone-100',
        },
        adminSelectWrapper:
          'relative w-8 h-full bg-stone-50/80 flex items-center justify-center overflow-hidden border-r border-stone-100',
        adminSelect: `absolute inset-0 w-full h-full bg-transparent text-stone-900 text-[11px] font-black appearance-none text-center m-0 p-0 border-none outline-none cursor-pointer z-10`,
        textButton: `py-0 ${FS.xs} font-black whitespace-nowrap flex items-center gap-1.5 px-3`,
        deleteIcon:
          'ml-1 text-red-400 hover:text-red-600 font-black text-xs transition-colors',
      },
      showMoreButton: `${BR.full} hidden items-center gap-1.5 px-4 py-2 ${FS.xs} font-black bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all`,
      addCategoryButton: `flex items-center justify-center w-9 h-9 border-2 border-dashed border-stone-200 text-stone-300 hover:border-stone-900 hover:text-stone-900 transition-all active:scale-90 group bg-stone-50/30 ${BR.low}`,
    },
  },

  productGrid: {
    layout: 'w-full flex flex-col min-h-[400px]',
    sectionSpacing: 'mt-12 first:mt-4',
    header: {
      wrapper:
        'flex items-center gap-3 mb-6 px-1',
      title: `${FS.base} font-black text-stone-900 tracking-tighter`,
      line: 'flex-1 h-px bg-stone-200',
      count: `${FS.xs} font-bold text-stone-400`,
    },
    cols: 'grid grid-cols-3',
    gap: 'gap-x-2 gap-y-2',
    emptyState: {
      wrapper: 'flex flex-col items-center justify-center py-20 text-stone-400',
      iconSize: 'w-16 h-16 mb-4 opacity-20',
      text: `${FS.sm} font-medium italic tracking-wide`,
      adminWrapper: `text-center py-16 border-2 border-dashed border-stone-100 ${BR.lg} mb-12 bg-stone-50/30`,
    },
  },

  footer: {
    layout: 'bg-white border-t border-stone-200 relative',
    container: 'max-w-7xl mx-auto px-4 py-10',
    grid: 'flex flex-col items-center justify-center gap-6',
    coupons: {
      wrapper:
        'flex flex-col items-center gap-2 w-full max-w-[240px]',
      label: `${FS.xs} font-black text-stone-300 tracking-[0.2em] uppercase`,
      inputWrapper: 'flex items-stretch gap-1 w-full h-10',
      input: `flex-1 px-4 py-2 border border-stone-200 text-stone-900 bg-stone-50/50 outline-none transition-all duration-300 ${FS.sm} font-bold focus:border-stone-900 focus:bg-white`,
      button: `w-10 h-10 flex items-center justify-center bg-stone-900 text-white transition-all active:scale-90 shrink-0`,
      statusWrapper: 'mt-1 text-center',
      statusText: `${FS.xs} font-bold uppercase tracking-tight`,
      successText: 'text-green-600',
      errorText: 'text-red-500',
    },
    bottomBar: {
      layout:
        'w-full py-3 bg-stone-900 flex items-center justify-center relative overflow-hidden group cursor-pointer',
      text: 'text-[10px] font-black text-white uppercase tracking-[0.3em] relative z-10 transition-transform duration-500 group-hover:scale-105',
    },
  },

  productCard: {
    container: `bg-white border-2 transition-smooth relative flex flex-col group rounded-[var(--radius-card)]`,
    activeBorder: 'border-stone-200',
    outOfStockBorder:
      'border-transparent bg-stone-50/50 grayscale-[0.8] opacity-70',
    shadow: 'hover:shadow-2xl hover:-translate-y-1',
    padding: 'px-2 pt-2 pb-1',
    gap: 'gap-1',
    innerLayout: {
      contentWrapper: 'flex flex-col gap-1',
      descriptionWrapper: 'relative min-h-[24px]',
      footerWrapper: 'mt-auto',
      adminActionsWrapper: 'transition-smooth',
      adminActionsActive: 'opacity-100 scale-100',
      adminActionsInactive: 'opacity-0 scale-90 pointer-events-none',
    },
    image: {
      wrapper: `relative w-full transition-smooth overflow-hidden group/img rounded-[calc(var(--radius-card)-4px)]`,
      aspect: 'aspect-square',
      bg: 'bg-stone-100',
      fit: 'object-cover',
      transition: 'transition-smooth',
      outOfStock: 'grayscale opacity-40',
      uploading: 'opacity-50 blur-[2px]',
      placeholderIcon:
        'text-5xl text-stone-300 select-none flex items-center justify-center',
      placeholderFrame: `bg-white px-2 py-1 border border-stone-200 shadow-sm flex items-center justify-center rounded-[var(--radius-button)]`,
      overlay:
        'absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center',
      changeBadge: `bg-white/90 px-3 py-1.5 shadow-xl rounded-[var(--radius-badge)] ${FS.xs}`,
      cursorUser: 'cursor-zoom-in',
      cursorAdmin: 'cursor-pointer',
    },
    typography: {
      name: `${FS.base} text-stone-900 leading-tight tracking-tight`,
      nameOutOfStock: 'opacity-40 text-stone-400',
      nameTransition: 'transition-standard',
      description: `${FS.xs} text-stone-600 leading-snug font-bold normal-case`,
      descriptionClamp: 'line-clamp-2',
      descriptionFull: 'w-full',
      price: ` font-black tracking-tight transition-smooth`,
      priceOutOfStock:
        'line-through opacity-30 text-stone-400 scale-95 origin-left',
      discountPrice: 'text-kraft-600',
      categoryBadge: `${FS.xs} text-stone-400`,
      editable: 'cursor-text focus:outline-none outline-none motion-fix',
    },
    adminMenu: {
      container: 'absolute right-1 bottom-1 z-30',
      toggleButton: '!bg-stone-50/80 backdrop-blur shadow-sm border-stone-200',
      dropdown: `absolute bottom-full right-0 mb-2 w-48 bg-white/95 backdrop-blur-2xl border border-stone-200 shadow-2xl py-2 z-50 origin-bottom-right rounded-[var(--radius-card)]`,
      item: 'w-full text-left px-4 py-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors',
      itemText: `${FS.sm} text-stone-800`,
      categoryListWrapper: 'max-h-48 overflow-y-auto py-1 custom-scrollbar',
      categoryActive: 'text-stone-900 bg-stone-100',
      categoryInactive: 'text-stone-500',
      mobileToggle: ` relative flex items-center justify-center w-6 h-6 bg-stone-50/80 backdrop-blur border border-stone-200 transition-all shadow-sm overflow-hidden active:scale-90 rounded-[var(--radius-button)]`,
      mobileIconColor: 'text-stone-500',
      backBtn: `w-full text-left px-4 py-2 ${FS.xs} font-black text-stone-400 bg-stone-50/50 border-b border-stone-100 uppercase flex items-center gap-2`,
      editHighlight: 'bg-amber-50/50',
      editBorder: 'border-amber-200',
      editPadding: 'px-1 py-0.5',
      textareaBase:
        'w-full focus:outline-none resize-none overflow-hidden block',
    },
    orderSelect: {
      container: 'absolute bottom-2 right-2 z-[25] transition-smooth transform',
      adminAnimation: 'opacity-100 scale-100',
      userAnimation: 'opacity-0 scale-90 pointer-events-none',
      wrapper: `relative w-8 h-8 bg-stone-900 shadow-2xl flex items-center justify-center overflow-hidden rounded-[var(--radius-button)]`,
      select: `absolute inset-0 w-full h-full bg-transparent text-white ${FS.xs} font-black appearance-none text-center m-0 p-0 border-none outline-none cursor-pointer`,
    },
    uploadOverlay: {
      wrapper:
        'absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[1px] z-10',
      spinner: `w-8 h-8 border-4 border-stone-300 border-t-stone-900 rounded-[var(--radius-badge)] animate-spin mb-2`,
      label: `${FS.xs} font-black text-stone-900 bg-white/80 px-2 py-0.5 rounded shadow-sm`,
    },
    status: {
      wrapper:
        'absolute inset-0 z-[5] pointer-events-none rounded-lg flex items-center justify-center gap-2',
      badge: `bg-stone-900/90 text-white w-9 h-9 rounded-[var(--radius-badge)] shadow-2xl flex items-center justify-center -translate-y-4`,
      outOfStockLabel: `bg-white/90 text-stone-900 px-3 py-1 rounded-[var(--radius-button)] shadow-xl ${FS.xs} font-black tracking-widest border border-stone-100`,
      iconSize: 'text-lg',
    },
  },

  addProductModal: {
    overlay:
      'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-smooth',
    container: `bg-white w-full max-w-sm rounded-[var(--radius-card)] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500`,
    header:
      'flex items-center justify-between px-6 py-5 border-b border-stone-100',
    headerButton: `!w-11 !h-11 !bg-stone-100 !text-stone-500 hover:!bg-stone-200 hover:!text-stone-900 rounded-[var(--radius-button)]`,
    body: 'p-6 space-y-6 overflow-y-auto custom-scrollbar',
    formGap: 'space-y-5',
    footer: 'flex gap-3 pt-2 pb-2',
    footerCancel:
      'flex-1 !border-2 !border-stone-100 !text-stone-400 !py-3.5',
    footerSubmit: 'flex-[1.5] !py-3.5',
    inputField: `w-full border border-stone-200 rounded-[var(--radius-button)] px-3 py-2.5 ${FS.sm} focus:outline-none focus:ring-2 focus:ring-stone-900 transition outline-none bg-stone-50/50`,
    stockToggle: `flex items-center justify-between bg-stone-50 border border-stone-200 rounded-[var(--radius-button)] px-4 py-3.5 shadow-sm`,
    checkbox: `w-5 h-5 text-stone-900 border-stone-300 rounded-[0.2rem] focus:ring-0 cursor-pointer shadow-sm`,
    categoryChipActive: `bg-stone-900 text-white border-stone-900 px-3 py-1.5 ${FS.xs} font-bold rounded-[var(--radius-badge)] transition-standard shadow-sm`,
    categoryChipInactive: `bg-white text-stone-600 border-stone-200 hover:border-stone-400 active:scale-95 px-3 py-1.5 ${FS.xs} font-bold rounded-[var(--radius-badge)] transition-standard shadow-sm`,
    categoryShowMore: `rounded-[var(--radius-badge)] px-3 py-1.5 ${FS.xs} font-bold border border-dashed border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700 transition-all bg-stone-50 active:scale-95`,
    wizard: {
      progressWrapper: 'flex gap-1 mt-1',
      progressBase:
        'h-1 w-6 rounded-full transition-smooth duration-500',
      stepActive: 'bg-kraft-600',
      stepInactive: 'bg-stone-200',
      stepContent:
        'space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500',
    },
    typography: {
      label: `${FS.xs} font-semibold text-stone-600 mb-1`,
      categoryLabel: `${FS.xs} font-semibold text-stone-600 mb-2`,
      errorBadge: `bg-red-50 text-red-600 ${FS.xs} font-bold uppercase p-3 rounded-[var(--radius-button)] text-center border border-red-100 shadow-sm`,
    },
    imagePicker: {
      wrapper: 'flex flex-col items-center gap-3',
      frame: `w-24 h-24 shrink-0 rounded-[var(--radius-card)] bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden shadow-sm`,
      button: `cursor-pointer ${FS.xs} font-black text-stone-700 hover:text-stone-900 transition-colors border border-stone-200 px-5 py-2 rounded-[var(--radius-badge)] bg-white shadow-sm active:scale-95`,
    },
  },

  references: {
    layout: 'py-8 border-t border-stone-200',
    container: 'max-w-4xl mx-auto px-4',
    headerTitle: `text-center ${FS.xs} font-black text-stone-300 mb-8 tracking-[0.3em] uppercase`,
    grid: 'grid grid-cols-2 gap-4 items-center justify-items-center',
    card: {
      base: 'w-full flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-700 opacity-40 hover:opacity-100',
      logoSize: 'text-2xl select-none',
    },
  },

  pinModal: {
    overlay:
      'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl pointer-events-auto',
    container:
      'relative w-full max-w-[240px] flex flex-col items-center select-none transform transition-transform duration-300',
    headerWrapper: 'text-center mb-6',
    headerIconWrapper: `w-12 h-12 bg-white/20 backdrop-blur-md ${BR.md} flex items-center justify-center mx-auto mb-3 shadow-2xl border border-white/20`,
    headerIconSize: 'w-6 h-6 text-white',
    dotsWrapper: 'flex justify-center gap-4 mb-8',
    dotBase: `w-2.5 h-2.5 ${BR.full} border transition-all duration-300`,
    dotActive:
      'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)] border-white',
    dotInactive: 'bg-transparent border-white/40',
    dotError: 'bg-red-500 border-red-500',
    keyboardGrid: 'grid grid-cols-3 gap-x-4 gap-y-3 w-full',
    keyButton: `group relative w-14 h-14 ${BR.full} bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center mx-auto overflow-hidden active:scale-90 shadow-xl`,
    cancelButton: `w-14 h-14 ${BR.full} flex items-center justify-center mx-auto text-white/50 hover:text-white transition-colors ${FS.xs} font-bold active:scale-95`,
    deleteButton: `w-14 h-14 ${BR.full} flex items-center justify-center mx-auto text-white/70 hover:text-white active:scale-90 transition-all`,
    deleteIconSize: 'w-6 h-6',
    typography: {
      title: `${FS.base} text-white font-black uppercase tracking-widest`,
      subtitle: `${FS.xs} text-white/60 mt-1 font-bold`,
      keyText: `${FS.lg} font-black text-white leading-none`,
    },
    animations: {
      shake: 'animate-shake',
      lockout: 'opacity-20 pointer-events-none grayscale',
    },
  },

  modal: {
    overlay:
      'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/40 backdrop-blur-2xl p-4 pointer-events-auto',
    closeButtonWrapper:
      'absolute top-6 right-6 z-[210]',
    closeButtonCustom: '!bg-white/80',
    imageWrapper:
      'w-full flex items-center justify-center max-h-[50vh]',
    image: `max-w-full max-h-[50vh] object-contain shadow-2xl ${BR.lg}`,
    contentWrapper:
      'text-center space-y-4 w-full max-w-2xl mt-2',
    headerWrapper: 'space-y-1',
    title: `${FS.xl} text-stone-900`,
    description: `${FS.base} text-stone-500 leading-relaxed font-medium px-6`,
    priceBadge: `bg-white/80 backdrop-blur-sm px-6 py-2.5 border border-stone-100 shadow-sm ${FS.lg} text-stone-900 ${BR.full}`,
    actionArea: 'flex flex-col items-center gap-5 pt-2',
  },

  loading: {
    spinner:
      'border-2 border-white/30 border-t-white rounded-full animate-spin',
    overlay: 'bg-white/30 backdrop-blur-[1px]',
    text: 'font-black uppercase tracking-widest',
  },
};

/**
 * UI SETTINGS (LAYOUT & LIMITS)
 */
export const UI = {
  layout: {
    bodyBg: 'bg-stone-50',
    selection: 'selection:bg-stone-900 selection:text-white',
    container: 'max-w-7xl mx-auto px-4',
    adminLimit: 999,
  },
  animations: {
    fadeIn: '',
    slideUp: '',
  },
  category: {
    initialVisible: 6,
  },
  errorState: {
    overlay:
      'min-h-screen flex flex-col items-center justify-center p-6 text-center bg-stone-50',
    card: `bg-white p-10 ${BR.lg} shadow-2xl border border-stone-100 max-w-sm w-full`,
    icon: 'text-6xl mb-6 block',
    title: `${FS.lg} text-stone-900 mb-3`,
    description: `${FS.sm} text-stone-500 leading-relaxed mb-8`,
    button: `w-full bg-stone-900 text-white py-4 ${BR.md} ${FS.xs} font-black hover:bg-stone-800 active:scale-95 transition-all shadow-xl`,
  },
};
