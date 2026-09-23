'use client';

import { useState, useCallback, useMemo } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/Button';
import ResumePreview from '@/components/preview/ResumePreview';
import TemplateSelector from '@/components/preview/TemplateSelector';
import ProfileCompletenessWidget from '@/components/ui/ProfileCompletenessWidget';
import ATSCompatibilityCard from '@/components/ui/ATSCompatibilityCard';
import type { ResumeTemplate } from '@/types/resume';

type PageSize = 'letter' | 'a4';
type ExportFormat = 'docx' | 'pdf';

export default function StepReview() {
  const { state, dispatch } = useResume();

  const pageSize = state.settings.pageSize;

  const [fitsOnePage, setFitsOnePage] = useState(true);
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fileName = useMemo(() => {
    const parts = (state.personal.fullName ?? '').trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'Resume';
    const first = parts[0];
    const last = parts.length > 1 ? parts[parts.length - 1] : '';
    return last ? `${first}_${last}_Resume` : `${first}_Resume`;
  }, [state.personal.fullName]);

  const handleOverflowChange = useCallback((overflows: boolean) => {
    setFitsOnePage(!overflows);
  }, []);

  const handlePageSizeChange = useCallback(
    (size: PageSize) => {
      dispatch({ type: 'SET_SETTINGS', payload: { pageSize: size } });
    },
    [dispatch],
  );

  const handleTemplateChange = useCallback(
    (template: ResumeTemplate) => {
      dispatch({ type: 'SET_SETTINGS', payload: { template } });
    },
    [dispatch],
  );

  const handleDownload = useCallback(
    async (format: ExportFormat) => {
      setDownloading(format);
      setDownloadError(null);

      try {
        const response = await fetch(
          `/api/generate?format=${encodeURIComponent(format)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...state,
              settings: { ...state.settings, pageSize },
            }),
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || `Server error: ${response.status}`,
          );
        }

        if (format === 'pdf') {
          const html = await response.text();
          const printWin = window.open('', '_blank', 'width=850,height=1100');
          if (printWin) {
            printWin.document.open();
            printWin.document.write(html);
            printWin.document.close();

            // Use a timeout to ensure the page renders before printing.
            // The afterprint event (or a fallback timeout) closes the popup,
            // preventing the freeze that occurred when users canceled print.
            const triggerPrint = () => {
              printWin.focus();
              printWin.print();
            };

            // Clean up: close the popup after print completes or is canceled
            const cleanup = () => {
              try {
                printWin.close();
              } catch {
                // Window might already be closed
              }
            };

            // afterprint fires after the print dialog is dismissed (print or cancel)
            printWin.addEventListener('afterprint', cleanup, { once: true });

            // Fallback: if afterprint doesn't fire (some browsers), close after 60s
            const fallbackTimer = setTimeout(() => {
              try {
                if (!printWin.closed) printWin.close();
              } catch {
                // ignore
              }
            }, 60000);

            printWin.addEventListener('afterprint', () => clearTimeout(fallbackTimer), { once: true });

            // Wait for the document to fully load before printing
            if (printWin.document.readyState === 'complete') {
              setTimeout(triggerPrint, 300);
            } else {
              printWin.onload = () => setTimeout(triggerPrint, 300);
            }
          }
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      } catch (err: unknown) {
        setDownloadError(
          err instanceof Error ? err.message : 'Download failed. Please try again.',
        );
      } finally {
        setDownloading(null);
      }
    },
    [state, pageSize, fileName],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Review &amp; Export
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Choose a template, review your ATS score, and download your resume.
        </p>
      </div>

      {/* Job Description & ATS Scores */}
      <div className="space-y-4 bg-[#FAFAF9] border border-[#E4E4DF] p-4 rounded-lg">
        <div>
          <label htmlFor="job-description-input" className="block text-sm font-medium text-[#1C1C1A] mb-1 flex items-center gap-2">
            <span>🎯 Target Job Description</span>
            <span className="text-xs font-normal text-[#6B6B63]">(Optional)</span>
          </label>
          <textarea
            id="job-description-input"
            rows={3}
            className="w-full rounded-[6px] border border-[#E4E4DF] px-3 py-2 text-sm focus:border-[#33415C] focus:outline-none focus:ring-1 focus:ring-[#33415C] placeholder:text-[#A1A1AA]"
            placeholder="Paste the job description here to see your keyword match score..."
            value={state.targetJobDescription || ''}
            onChange={(e) => dispatch({ type: 'SET_JOB_DESCRIPTION', payload: e.target.value })}
          />
        </div>
        
        <ATSCompatibilityCard data={state} />
        
        <div className="mt-4">
          <ProfileCompletenessWidget data={state} />
        </div>
      </div>

      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-[#1C1C1A] mb-2">
          Choose Template
        </label>
        <TemplateSelector
          selected={state.settings.template || 'classic'}
          onSelect={handleTemplateChange}
        />
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Page Size Toggle */}
        <div className="flex items-center rounded-[6px] border border-[#E4E4DF] overflow-hidden">
          <button
            type="button"
            onClick={() => handlePageSizeChange('letter')}
            className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#33415C] ${
              pageSize === 'letter'
                ? 'bg-[#33415C] text-white'
                : 'bg-white text-[#6B6B63] hover:bg-[#FAFAF9]'
            }`}
          >
            Letter
          </button>
          <button
            type="button"
            onClick={() => handlePageSizeChange('a4')}
            className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#33415C] ${
              pageSize === 'a4'
                ? 'bg-[#33415C] text-white'
                : 'bg-white text-[#6B6B63] hover:bg-[#FAFAF9]'
            }`}
          >
            A4
          </button>
        </div>

        {/* Fit Status Pill */}
        {fitsOnePage ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Fits on one page
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Content overflows — try reducing projects or bullets
          </span>
        )}
      </div>

      {/* Resume Preview */}
      <div className="border border-[#E4E4DF] rounded-[6px] overflow-hidden bg-white">
        <ResumePreview
          data={{ ...state, settings: { ...state.settings, pageSize } }}
          onOverflowChange={handleOverflowChange}
        />
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          onClick={() => handleDownload('docx')}
          disabled={downloading !== null}
          loading={downloading === 'docx'}
          id="download-docx-btn"
        >
          {downloading === 'docx' ? 'Generating…' : 'Download .docx'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleDownload('pdf')}
          disabled={downloading !== null}
          loading={downloading === 'pdf'}
          id="download-pdf-btn"
        >
          {downloading === 'pdf' ? 'Generating…' : 'Download .pdf'}
        </Button>
      </div>

      {/* Download Error */}
      {downloadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[6px] text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{downloadError}</span>
        </div>
      )}
    </div>
  );
}
