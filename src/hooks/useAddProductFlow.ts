import { useState, useCallback, useEffect } from 'react';
import { LABELS } from '../data/config';
import { useStore } from '../store';

const INITIAL_FORM_STATE = {
  productName: '',
  selectedCategory: '',
  customCategoryName: '',
  productPrice: '',
  currency: '₺',
  productDescription: '',
  selectedImageFile: null as File | null,
  selectedImageUrl: null as string | null,
  isProductInStock: true,
};

export function useAddProductFlow(
  isModalOpen: boolean,
  initialCategory?: string,
  initialStep?: number,
  onProductAddition?: (product: any, file?: File) => Promise<any> | void,
  onModalClose?: () => void,
) {
  const { settings } = useStore();
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [temporaryImagePreviewUrl, setTemporaryImagePreviewUrl] = useState<
    string | null
  >(null);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  // Effect: Handle initial category sync and cleanup memory leaks from image previews
  useEffect(() => {
    if (isModalOpen && initialCategory) {
      setFormState((prev) => ({
        ...prev,
        selectedCategory: initialCategory,
        customCategoryName: '',
      }));
    }

    // Cleanup: Memory leak prevention (revoking temporary image URLs)
    return () => {
      if (temporaryImagePreviewUrl) {
        URL.revokeObjectURL(temporaryImagePreviewUrl);
      }
    };
  }, [isModalOpen, initialCategory, temporaryImagePreviewUrl]);

  // Sync step from props if provided (Workspace Mode)
  useEffect(() => {
    if (initialStep !== undefined) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  const handleCloseAndReset = useCallback(() => {
    if (isSubmittingData) return;

    // Direct cleanup for the preview URL before resting state
    if (temporaryImagePreviewUrl) {
      URL.revokeObjectURL(temporaryImagePreviewUrl);
    }

    setFormState(INITIAL_FORM_STATE);
    setTemporaryImagePreviewUrl(null);
    setFormErrorMessage('');
    setCurrentStep(1);
    if (onModalClose) onModalClose();
  }, [isSubmittingData, onModalClose, temporaryImagePreviewUrl]);

  const handleFormInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormState((previousState) => ({
        ...previousState,
        [name]: value,
        selectedCategory:
          name === 'customCategoryName' && value.trim()
            ? ''
            : previousState.selectedCategory,
      }));
      setFormErrorMessage('');
    },
    [],
  );

  const handleCategorySelection = useCallback((category: string) => {
    setFormState((previousState) => ({
      ...previousState,
      selectedCategory: category,
      customCategoryName: '',
    }));
  }, []);

  const handleImageFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Revoke old URL before creating new one
      if (temporaryImagePreviewUrl) {
        URL.revokeObjectURL(temporaryImagePreviewUrl);
      }

      setFormState((previousState) => ({
        ...previousState,
        selectedImageFile: file,
      }));
      const localUrl = URL.createObjectURL(file);
      setTemporaryImagePreviewUrl(localUrl);
      setCurrentStep(2); // AUTO ADVANCE TO NAME
    },
    [temporaryImagePreviewUrl],
  );

  const handleProductSubmission = async () => {
    if (isSubmittingData || !onProductAddition) return;
    const finalizedCategory =
      formState.customCategoryName.trim() || formState.selectedCategory.trim();

    setIsSubmittingData(true);
    setSubmissionStatus('loading');
    try {
      const { transformCurrencyStringToNumber } =
        await import('../utils/price');
      const numericPrice = transformCurrencyStringToNumber(
        formState.productPrice,
      );

      // Manual currency prefixing for the Diamond Standard
      const standardizedPriceLabel = `${formState.currency}${numericPrice}`;

      if (!settings?.id) throw new Error('Mağaza ID bulunamadı');

      await onProductAddition(
        {
          name: formState.productName.trim(),
          category: finalizedCategory,
          price: standardizedPriceLabel,
          description: formState.productDescription.trim(),
          image_url: formState.selectedImageUrl,
          out_of_stock: !formState.isProductInStock,
          is_archived: false,
          store_id: settings.id,
        },
        formState.selectedImageFile || undefined,
      );

      setSubmissionStatus('success');
      setTimeout(() => {
        handleCloseAndReset();
        setSubmissionStatus('idle');
      }, 2000);
    } catch {
      setSubmissionStatus('error');
      setFormErrorMessage(LABELS.saveError);
      setTimeout(() => setSubmissionStatus('idle'), 3000);
    } finally {
      setIsSubmittingData(false);
    }
  };

  const selectTemplate = useCallback((template: any) => {
    setFormState((prev) => ({
      ...prev,
      productName: template.name,
      selectedCategory: template.category,
      customCategoryName: '',
      productPrice: template.price,
      productDescription: template.description,
      selectedImageFile: null,
      selectedImageUrl: template.image_url,
    }));
    setTemporaryImagePreviewUrl(template.image_url);
    setCurrentStep(7); // Jump directly to preview step (Step 7)
  }, []);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const isStepValid = () => {
    if (currentStep === 1 && !formState.selectedImageFile) return true; // Allows skipping photo
    if (currentStep === 2) return !!formState.productName.trim();
    if (currentStep === 4)
      return !!(
        formState.selectedCategory.trim() || formState.customCategoryName.trim()
      );
    if (currentStep === 5) return !!formState.productPrice.trim();
    return true;
  };

  return {
    currentStep,
    setCurrentStep,
    formState,
    setFormState,
    temporaryImagePreviewUrl,
    formErrorMessage,
    isSubmittingData,
    submissionStatus,
    handleCloseAndReset,
    handleFormInputChange,
    handleCategorySelection,
    handleImageFileSelection,
    handleProductSubmission,
    selectTemplate,
    nextStep,
    prevStep,
    isStepValid,
  };
}
