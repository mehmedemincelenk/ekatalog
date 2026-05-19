import { useState, useEffect } from 'react';
import { Product } from '../types';
import { useScrollLock } from './useCommon';
import { downloadImage } from '../utils/image';

export function useEditProdCardFlow(
  product: Product,
  onDelete: (id: string) => void,
  onUpdate: (id: string, data: Partial<Product>) => void,
  onImageUpload?: (id: string, file: File) => Promise<any>,
  isOpen?: boolean,
  setIsOpen?: (isOpen: boolean) => void,
  initialStep?: number,
) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'PRODUCT' | 'IMAGE' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync scroll lock
  useScrollLock(!!isOpen);

  // Reset local states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Workspace Step Sync
  useEffect(() => {
    if (initialStep !== undefined) {
      if (initialStep === 1) {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      } else if (initialStep === 2) {
        setShowDeleteConfirm(true);
        setDeleteTarget(null);
      } else if (initialStep === 3) {
        setShowDeleteConfirm(true);
        setDeleteTarget('PRODUCT');
      } else if (initialStep === 4) {
        setShowDeleteConfirm(true);
        setDeleteTarget('IMAGE');
      }
    }
  }, [initialStep]);

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !onImageUpload) return;

    setIsUploading(true);
    try {
      await onImageUpload(product.id, selectedFile);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    const targetUrl = product.polished_image_url || product.image_url;
    if (!targetUrl) return;

    const hqUrl = !product.polished_image_url
      ? targetUrl.replace('/lq/', '/hq/').split('?')[0]
      : targetUrl;

    const cleanName = product.name.replace(/\s+/g, '-').toLowerCase();
    downloadImage(hqUrl, `diamond-${cleanName}.png`);
  };

  const handleAction = (
    type: 'ARCHIVE' | 'STOCK' | 'DOWNLOAD' | 'CATEGORY',
    value?: string | boolean,
  ) => {
    if (type === 'ARCHIVE') onUpdate(product.id, { is_archived: !!value });
    else if (type === 'STOCK') onUpdate(product.id, { out_of_stock: !value });
    else if (type === 'DOWNLOAD') handleDownload();
    else if (type === 'CATEGORY' && typeof value === 'string')
      onUpdate(product.id, { category: value });
  };

  const finalizeDelete = () => {
    if (deleteTarget === 'PRODUCT') {
      onDelete(product.id);
      setIsOpen?.(false);
    } else if (deleteTarget === 'IMAGE') {
      onUpdate(product.id, { image_url: '' });
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteTarget,
    setDeleteTarget,
    isUploading,
    setIsUploading,
    handleImageFileChange,
    handleAction,
    finalizeDelete,
  };
}
