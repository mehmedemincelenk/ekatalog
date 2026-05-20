import { memo, forwardRef } from 'react';
import { THEME } from '../../data/config';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> { labelText?: string; id: string; containerClassName?: string; }

export default memo(forwardRef<HTMLInputElement, FormInputProps>(({ labelText: l, id: i, className: c = '', containerClassName: cc = '', ...p }, r) => (
  <div className={cc}>
    {l && <label htmlFor={i} className={THEME.addProductModal.typography.label}>{l}</label>}
    <input ref={r} id={i} {...p} className={`${THEME.addProductModal.inputField} ${c}`} />
  </div>
)));
