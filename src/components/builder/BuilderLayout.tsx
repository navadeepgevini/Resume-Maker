'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useResume } from '@/context/ResumeContext';
import { useAuth } from '@/context/AuthContext';
import { ProgressBar } from '@/components/wizard';
import ResumePreview from '@/components/preview/ResumePreview';
import FileDropZone from '@/components/ui/FileDropZone';
import ResetDataButton from '@/components/ui/ResetDataButton';
import ProfileCompletenessWidget from '@/components/ui/ProfileCompletenessWidget';

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const { state } = useResume();
  const { user, logout } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E4E4DF] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#1C1C1A]"
            style={{ fontFamily: 'var(--font-plex-sans)' }}
          >
            RESUMEMAKER
          </Link>

          <div className="flex items-center gap-3">
            {/* Import toggle */}
            <button
              type="button"
              onClick={() => setShowImport(!showImport)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] border border-[#E4E4DF] text-[#33415C] hover:bg-[#FAFAF9] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Import
            </button>

            {/* Reset */}
            <ResetDataButton />

            {/* User info */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E4E4DF]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#33415C] text-white flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-[#1C1C1A] hidden sm:inline">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-medium text-[#6B6B63] hover:text-[#1C1C1A] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-[#33415C] hover:underline"
              >
                Sign In
              </Link>
            )}

            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[4px] border border-[#E4E4DF] text-[#33415C] hover:bg-[#FAFAF9] transition-colors"
            >
              {showPreview ? '← Form' : 'Preview →'}
            </button>
          </div>
        </div>
      </header>

      {/* Import panel (collapsible) */}
      {showImport && (
        <div className="bg-white border-b border-[#E4E4DF] px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1C1A]">Import from File</h3>
                <p className="text-xs text-[#6B6B63]">
                  Drop a PDF, Word, or text file to auto-fill your resume using AI.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="text-[#6B6B63] hover:text-[#1C1C1A] p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FileDropZone compact={true} />
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white border-b border-[#E4E4DF]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <ProgressBar />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Form panel */}
        <div
          className={`w-full md:w-[55%] p-6 overflow-y-auto ${
            showPreview ? 'hidden md:block' : 'block'
          }`}
          style={{ maxHeight: 'calc(100vh - 130px)' }}
        >
          {children}
        </div>

        {/* Preview panel */}
        <div
          className={`w-full md:w-[45%] border-l border-[#E4E4DF] bg-[#f0f0ec] overflow-y-auto ${
            showPreview ? 'block' : 'hidden md:block'
          }`}
          style={{ maxHeight: 'calc(100vh - 130px)' }}
        >
          <ResumePreview data={state} />
          <div className="p-4">
            <ProfileCompletenessWidget data={state} />
          </div>
        </div>
      </main>
    </div>
  );
}
