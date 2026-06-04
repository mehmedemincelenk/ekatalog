import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { usePortfoysScraper } from '../../hooks/usePortfoysScraper';
import { useStore } from '../../store';
import PortfoysSearchView from './PortfoysSearchView';
import PortfoysDirectoryView from './PortfoysDirectoryView';

interface PortfoysLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'search' | 'directory';
}

export default function PortfoysLeadModal({
  isOpen,
  onClose,
  initialTab,
}: PortfoysLeadModalProps) {
  const { settings } = useStore();
  const storeId = settings?.id || '';
  const storeName = settings?.name || '';

  const {
    status,
    leads,
    error: apiError,
    startScan,
    clearScan,
    savedDirectory,
    loadingDirectory,
    fetchDirectory,
  } = usePortfoysScraper();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'search' | 'directory'>('search');
  const [lastSearchKey, setLastSearchKey] = useState<string | null>(null);

  // Wrap startScan to compute and remember the group key for automatic expansion
  const handleStartScan = async (params: {
    storeId: string;
    country: string;
    city: string;
    district?: string;
    keyword: string;
  }) => {
    const cleanDistrict = params.district || '';
    const key =
      `${params.country}_${params.city}_${cleanDistrict}_${params.keyword}`
        .toLowerCase()
        .replace(/\s+/g, '_');
    setLastSearchKey(key);
    await startScan(params);
  };

  // Fetch saved directory when directory tab opens or modal mounts
  useEffect(() => {
    if (isOpen && storeId) {
      fetchDirectory(storeId);
    }
  }, [isOpen, storeId, fetchDirectory]);

  // Sync activeTab with initialTab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // When search finishes successfully, transition to directory tab and reset search modal
  useEffect(() => {
    if (status === 'completed') {
      setActiveTab('directory');
      clearScan();
    }
  }, [status, clearScan]);

  // Reset search when modal closes
  const handleClose = () => {
    clearScan();
    onClose();
  };

  const credits = settings?.portfoys_credits ?? 2;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
      centerHeader={true}
      title={
        <div className="w-full flex justify-center -mt-2">
          <div className="inline-flex p-0.5 bg-stone-100 rounded-xl border border-stone-200/50 gap-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`px-5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activeTab === 'directory'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50 font-black'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              rehber
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                activeTab === 'search'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50 font-black'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              ara
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Body Content */}
        <div className="py-1">
          {activeTab === 'search' ? (
            <PortfoysSearchView
              credits={credits}
              storeName={storeName}
              storeId={storeId}
              status={status}
              leads={leads}
              apiError={apiError}
              startScan={handleStartScan}
              clearScan={clearScan}
            />
          ) : (
            <PortfoysDirectoryView
              savedDirectory={savedDirectory}
              loadingDirectory={loadingDirectory}
              lastSearchKey={lastSearchKey}
            />
          )}
        </div>

        {/* Minimalist Sketch-faithful Footer */}
        {activeTab === 'search' && status === 'idle' && credits > 0 && (
          <div className="text-center pt-2 border-t border-stone-50">
            <p className="text-[10px] text-stone-400 font-semibold tracking-wider lowercase">
              yıllık arama hakkınız 2 adettir. (kalan: {credits}/2)
            </p>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
