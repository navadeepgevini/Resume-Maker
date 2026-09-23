'use client';

import { type InputHTMLAttributes, useId } from 'react';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  /** Visible label rendered above the input */
  label: string;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Optional error message – triggers the error visual state */
  error?: string;
  /** Optional helper text shown below the input when there is no error */
  helperText?: string;
  /** HTML input type */
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'password';
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Unique element id – applied to the <input> and used for label linking */
  id: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * A styled text input with label, error state, and helper text.
 *
 * Fully accessible: the `<label>` is linked to the `<input>` via `htmlFor`,
 * `aria-invalid` is set when an error is present, and the error / helper
 * message is associated through `aria-describedby`.
 */
export function Input({
  label,
  value,
  onChange,
  error,
  helperText,
  type = 'text',
  placeholder,
  required = false,
  id,
  disabled = false,
  className = '',
  ...rest
}: InputProps) {
  const autoId = useId();
  const descriptionId = `${id}-description-${autoId}`;
  const hasError = Boolean(error);
  const descriptionText = hasError ? error : helperText;

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#1C1C1A] select-none"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-[#B91C1C]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={descriptionText ? descriptionId : undefined}
        className={[
          // Base
          'h-10 w-full rounded-[4px] border px-3 py-2 text-sm text-[#1C1C1A] outline-none',
          'placeholder:text-[#6B6B63] bg-white',
          'transition-[border-color,box-shadow] duration-150 ease-in-out',
          // Disabled
          disabled && 'cursor-not-allowed opacity-50',
          // Error vs normal border + focus ring
          hasError
            ? 'border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/30 focus:border-[#B91C1C]'
            : 'border-[#E4E4DF] focus:ring-2 focus:ring-[#33415C]/25 focus:border-[#33415C]',
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />

      {/* Error / Helper text */}
      {descriptionText && (
        <p
          id={descriptionId}
          className={`text-xs ${hasError ? 'text-[#B91C1C]' : 'text-[#6B6B63]'}`}
          role={hasError ? 'alert' : undefined}
        >
          {descriptionText}
        </p>
      )}
    </div>
  );
}
