'use client';

import { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** HTML button type */
  type?: 'button' | 'submit';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state – shows spinner and disables interactions */
  loading?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Unique element id */
  id?: string;
}

/* ------------------------------------------------------------------ */
/*  Inline SVG spinner – avoids an external dependency                */
/* ------------------------------------------------------------------ */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant class maps                                                */
/* ------------------------------------------------------------------ */
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: [
    'bg-[#33415C] text-white',
    'hover:bg-[#283348] active:bg-[#1e2738]',
    'focus-visible:ring-2 focus-visible:ring-[#33415C]/40 focus-visible:ring-offset-2',
  ].join(' '),
  secondary: [
    'border border-[#33415C] text-[#33415C] bg-transparent',
    'hover:bg-[#33415C]/5 active:bg-[#33415C]/10',
    'focus-visible:ring-2 focus-visible:ring-[#33415C]/40 focus-visible:ring-offset-2',
  ].join(' '),
  ghost: [
    'border-none text-[#6B6B63] bg-transparent',
    'hover:bg-[#E4E4DF]/50 active:bg-[#E4E4DF]/80',
    'focus-visible:ring-2 focus-visible:ring-[#33415C]/40 focus-visible:ring-offset-2',
  ].join(' '),
};

/**
 * A versatile button with three variants, loading state, and full
 * keyboard accessibility. Renders as a `<button>` element.
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  id,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={[
        // Base
        'inline-flex h-10 items-center justify-center gap-2 rounded-[4px] px-4 text-sm font-medium',
        'select-none outline-none transition-colors duration-150 ease-in-out',
        // Disabled / loading
        isDisabled && 'cursor-not-allowed opacity-50',
        // Variant
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
