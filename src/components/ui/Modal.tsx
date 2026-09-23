'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
  useCallback,
  useId,
} from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Called when the user requests to close (backdrop click, Escape, × button) */
  onClose: () => void;
  /** Optional title shown in the modal header */
  title?: string;
  /** Modal body content */
  children: ReactNode;
  /** Max width class (default: max-w-lg) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/* ------------------------------------------------------------------ */
/*  Focusable‑element query                                            */
/* ------------------------------------------------------------------ */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A centered modal dialog with:
 *
 * - Semi-transparent backdrop (click to close)
 * - Escape key to close
 * - Focus trap while open
 * - Fade‑in / scale entrance animation
 * - Portalled to `document.body` to avoid stacking‑context issues
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = 'lg' }: ModalProps) {
  const autoId = useId();
  const titleId = title ? `modal-title-${autoId}` : undefined;
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Focus trap                                                      */
  /* ---------------------------------------------------------------- */
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !overlayRef.current) return;

    const focusable = overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Escape key                                                      */
  /* ---------------------------------------------------------------- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      trapFocus(e);
    },
    [onClose, trapFocus],
  );

  /* ---------------------------------------------------------------- */
  /*  Side effects                                                    */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    // Stash previously‑focused element so we can restore it on close.
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus into the modal.
    const timer = requestAnimationFrame(() => {
      const first =
        overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    document.addEventListener('keydown', handleKeyDown);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  /* ---------------------------------------------------------------- */
  /*  Render nothing when closed                                      */
  /* ---------------------------------------------------------------- */
  if (!isOpen) return null;

  return createPortal(
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-[fadeIn_150ms_ease-out]"
      onClick={(e) => {
        // Close only when clicking the backdrop itself.
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Card */}
      <div
        className={[
          `relative w-full max-w-${maxWidth} rounded-[6px] bg-white max-h-[90vh] flex flex-col`,
          'animate-[scaleIn_150ms_ease-out]',
        ].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-[#E4E4DF] px-5 py-3">
            <h2
              id={titleId}
              className="text-base font-semibold text-[#1C1C1A]"
            >
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#6B6B63] transition-colors hover:bg-[#E4E4DF] hover:text-[#1C1C1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33415C]/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {/* Close button when no title */}
        {!title && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#6B6B63] transition-colors hover:bg-[#E4E4DF] hover:text-[#1C1C1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33415C]/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>

      {/* Keyframe styles injected once (inline <style>) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
