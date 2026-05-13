import { memo, forwardRef } from 'react';
import { THEME } from '../../data/config';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  id: string;
  className?: string;
  containerClassName?: string;
}

/**
 * FORM INPUT (Diamond Edition)
 * -----------------------------------------------------------
 * Standardized input component for consistent UI across all forms.
 */
const FormInput = memo(forwardRef<HTMLInputElement, FormInputProps>(({ 
  labelText, 
  id, 
  className = '', 
  containerClassName = '',
  ...inputProperties 
}, ref) => {
  const modalTheme = THEME.addProductModal; // Using these shared tokens

  return (
    <div className={containerClassName}>
      {labelText && (
        <label htmlFor={id} className={modalTheme.typography.label}>
          {labelText}
        </label>
      )}
      <input 
        ref={ref}
        id={id} 
        {...inputProperties} 
        className={`${modalTheme.inputField} ${className}`} 
      />
    </div>
  );
}));

FormInput.displayName = 'FormInput';
export default FormInput;
