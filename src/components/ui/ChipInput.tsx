'use client';

import { type KeyboardEvent, useRef, useState, useId } from 'react';

export interface ChipInputProps {
  /** Visible label rendered above the chip input */
  label: string;
  /** Current list of chips */
  chips: string[];
  /** Callback when the chip list changes */
  onChipsChange: (chips: string[]) => void;
  /** Placeholder shown in the text input */
  placeholder?: string;
  /** Unique element id for the underlying input */
  id: string;
  /** Additional CSS class names on the wrapper */
  className?: string;
}

/**
 * A text input that creates chip / tag tokens on **Enter** or **comma**.
 *
 * - Chips are displayed inline before the text input.
 * - Each chip has a visible × button (also reachable via keyboard).
 * - Pressing **Backspace** on an empty input removes the last chip.
 */
export function ChipInput({
  label,
  chips,
  onChipsChange,
  placeholder,
  id,
  className = '',
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const listId = `${id}-chip-list-${autoId}`;

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                         */
  /* ---------------------------------------------------------------- */

  /** Add a chip (trims & deduplicates). */
  const addChip = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !chips.includes(trimmed)) {
      onChipsChange([...chips, trimmed]);
    }
    setInputValue('');
  };

  /** Remove a chip by index. */
  const removeChip = (index: number) => {
    onChipsChange(chips.filter((_, i) => i !== index));
  };

  /* ---------------------------------------------------------------- */
  /*  Keyboard handler                                                */
  /* ---------------------------------------------------------------- */

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
      removeChip(chips.length - 1);
    }
  };

  /** Handle commas pasted / typed inside the onChange value. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach((p, i) => {
        if (i < parts.length - 1) addChip(p);
      });
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(val);
    }
  };

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#1C1C1A] select-none"
      >
        {label}
      </label>

      {/* Container */}
      <div
        className={[
          'flex min-h-[40px] w-full flex-wrap items-center gap-1.5 rounded-[4px] border border-[#E4E4DF] bg-white px-3 py-1.5',
          'transition-[border-color,box-shadow] duration-150 ease-in-out',
          'focus-within:border-[#33415C] focus-within:ring-2 focus-within:ring-[#33415C]/25',
        ].join(' ')}
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        {/* Chips */}
        {chips.length > 0 && (
          <ul
            id={listId}
            className="contents"
            role="list"
            aria-label={`${label} chips`}
          >
            {chips.map((chip, index) => (
              <li
                key={`${chip}-${index}`}
                role="listitem"
                className="inline-flex items-center gap-1 rounded-sm bg-[#E4E4DF] px-2 py-0.5 font-mono text-sm text-[#1C1C1A]"
              >
                <span>{chip}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(index);
                  }}
                  aria-label={`Remove ${chip}`}
                  className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-sm text-[#6B6B63] transition-colors hover:bg-[#1C1C1A]/10 hover:text-[#1C1C1A] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#33415C]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Text input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={chips.length === 0 ? placeholder : undefined}
          aria-label={chips.length > 0 ? `Add more ${label}` : undefined}
          className="min-w-[80px] flex-1 bg-transparent py-0.5 text-sm text-[#1C1C1A] outline-none placeholder:text-[#6B6B63]"
        />
      </div>
    </div>
  );
}
