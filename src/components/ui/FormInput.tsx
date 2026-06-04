import { memo, forwardRef } from 'react';
import { THEME } from '../../data/config';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  id: string;
  containerClassName?: string;
  onlyDigits?: boolean;
}

const FormInput = memo(
  forwardRef<HTMLInputElement, FormInputProps>(
    (
      {
        labelText,
        id,
        className = '',
        containerClassName = '',
        onlyDigits,
        onChange,
        ...props
      },
      ref,
    ) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onlyDigits) {
          e.target.value = e.target.value.replace(/\D/g, '');
        }
        if (onChange) onChange(e);
      };

      return (
        <div className={containerClassName}>
          {labelText && (
            <label
              htmlFor={id}
              className={THEME.addProductModal.typography.label}
            >
              {labelText}
            </label>
          )}
          <input
            ref={ref}
            id={id}
            onChange={handleChange}
            {...props}
            className={`${THEME.addProductModal.inputField} ${className}`}
          />
        </div>
      );
    },
  ),
);

export default FormInput;
