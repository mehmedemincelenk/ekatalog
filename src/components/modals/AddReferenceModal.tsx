import { useState, useRef, useEffect, memo } from 'react';
import BaseModal from './BaseModal';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import * as Lucide from 'lucide-react';

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, file: File | null) => Promise<boolean>;
}

const AddReferenceModal = memo(({ isOpen, onClose, onSave }: AddReferenceModalProps) => {
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      // Auto-populate name from file name if name is empty
      if (!name) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setName(baseName);
      }
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResetAndClose = () => {
    setName('');
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName && !selectedFile) return;

    setIsLoading(true);
    try {
      const success = await onSave(trimmedName, selectedFile);
      if (success) {
        handleResetAndClose();
      }
    } catch (err) {
      console.error('Failed to save reference:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = name.trim() || selectedFile;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="YENİ REFERANS EKLE"
      subtitle="Galeriden logo seçebilir veya metin olarak bir isim yazabilirsiniz."
      disableClickOutside={isLoading}
      hideCloseButton={isLoading}
    >
      <div className="flex flex-col gap-6">
        {/* LOGO UPLOAD AREA */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            REFERANS LOGOSU (OPSİYONEL)
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <div 
              onClick={handleTriggerUpload}
              className="relative w-full h-32 border-2 border-solid border-stone-200 rounded-2xl bg-stone-50/50 flex items-center justify-center cursor-pointer group overflow-hidden transition-all duration-300 hover:border-stone-400"
            >
              <img
                src={previewUrl}
                alt="Selected Logo Preview"
                className="max-h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Overlay Action Buttons */}
              <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerUpload();
                  }}
                  variant="glass"
                  size="sm"
                  className="!text-stone-900"
                >
                  DEĞİŞTİR
                </Button>
                <Button
                  onClick={handleRemoveImage}
                  variant="danger"
                  size="sm"
                >
                  SİL
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTriggerUpload}
              className="w-full h-32 border-2 border-dashed border-stone-200 hover:border-stone-950/40 rounded-2xl bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center gap-2 transition-all duration-300 outline-none cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-400 group-hover:text-stone-700 transition-colors duration-300">
                <Lucide.Image size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-700 transition-colors duration-300">
                GALERİDEN LOGO SEÇ
              </span>
            </button>
          )}
        </div>

        {/* REFERENCE NAME INPUT */}
        <FormInput
          id="reference-name"
          labelText="REFERANS / İŞ ORTAĞI ADI"
          placeholder="Örn: Lider İş Ortakları"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-2">
          <Button
            onClick={handleResetAndClose}
            variant="secondary"
            className="flex-1 h-12"
            disabled={isLoading}
          >
            İPTAL
          </Button>
          <Button
            onClick={handleSubmit}
            variant="action"
            className="flex-1 h-12"
            disabled={!isValid}
            loading={isLoading}
          >
            TAMAM
          </Button>
        </div>
      </div>
    </BaseModal>
  );
});

AddReferenceModal.displayName = 'AddReferenceModal';
export default AddReferenceModal;
