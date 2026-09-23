'use client';

import { useId } from 'react';

export interface ToggleProps {
  /** Label displayed to the right of the toggle */
  label: string;
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Optional description shown below the label in warm gray */
  description?: string;
  /** Unique element id for the toggle button */
  id: string;
}

/**
 * An accessible toggle / switch control.
 *
 * - Uses `role="switch"` with `aria-checked` for screen‑reader support.
 * - Keyboard: toggle via **Space** or **Enter** (native `<button>` behavior).
 * - The sliding dot animates smoothly between states.
 */
export function Toggle({
  label,
  checked,
  onChange,
  description,
  id,
}: ToggleProps) {
  const autoId = useId();
  const labelId = `${id}-label-${autoId}`;
  const descId = description ? `${id}-desc-${autoId}` : undefined;

  return (
    <div className="flex items-start gap-3">
      {/* Track */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33415C]/40 focus-visible:ring-offset-2',
          checked ? 'bg-[#33415C]' : 'bg-[#E4E4DF]',
        ].join(' ')}
      >
        {/* Dot */}
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-[20px]' : 'translate-x-[2px]',
          ].join(' ')}
        />
      </button>

      {/* Label + description */}
      <div className="flex flex-col">
        <span
          id={labelId}
          className="text-sm font-medium text-[#1C1C1A] select-none"
        >
          {label}
        </span>
        {description && (
          <span id={descId} className="mt-0.5 text-xs text-[#6B6B63]">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
