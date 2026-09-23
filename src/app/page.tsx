'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FileDropZone from '@/components/ui/FileDropZone';
import ATSCheckerModal from '@/components/ui/ATSCheckerModal';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#E4E4DF] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#1C1C1A]"
            style={{ fontFamily: 'var(--font-plex-sans)' }}
          >
            RESUMEMAKER
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
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
                </div>
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
                className="inline-flex items-center px-3.5 py-1.5 text-sm font-medium rounded-[4px] border border-[#E4E4DF] bg-white text-[#1C1C1A] hover:bg-[#FAFAF9] transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              href={user ? "/dashboard" : "/builder/default"}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-[4px] bg-[#33415C] text-white hover:bg-[#283349] transition-colors"
            >
              {user ? "Dashboard" : "Start Building"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1C1C1A] leading-tight"
            style={{ fontFamily: 'var(--font-plex-sans)' }}
          >
            Your resume,
            <br />
            <span className="text-[#33415C]">built right.</span>
          </h1>

          <p className="text-lg text-[#6B6B63] max-w-lg mx-auto leading-relaxed">
            A guided, step-by-step builder that produces a polished, single-page,
            ATS-friendly resume — ready to download as Word or PDF.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl mx-auto">
            {/* Start from Scratch */}
            <Link
              href={user ? "/dashboard" : "/builder/default"}
              className="flex flex-col items-center justify-center w-full sm:w-1/3 p-5 rounded-xl border border-[#E4E4DF] bg-white hover:border-[#33415C] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#33415C]/5 text-[#33415C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-semibold text-[#1C1C1A]">Start from Scratch</span>
              <span className="text-sm text-[#6B6B63] text-center mt-1">Build step-by-step</span>
            </Link>

            {/* Import & Build */}
            <button
              onClick={() => {
                document.getElementById('import-zone')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center w-full sm:w-1/3 p-5 rounded-xl border border-[#E4E4DF] bg-white hover:border-[#33415C] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#33415C]/5 text-[#33415C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="font-semibold text-[#1C1C1A]">Import & Build</span>
              <span className="text-sm text-[#6B6B63] text-center mt-1">AI fills your data</span>
            </button>

            {/* Check ATS Score */}
            <button
              onClick={() => setIsAtsModalOpen(true)}
              className="flex flex-col items-center justify-center w-full sm:w-1/3 p-5 rounded-xl border border-[#33415C] bg-[#33415C] text-white hover:bg-[#283349] hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold relative z-10">Check ATS Score</span>
              <span className="text-sm text-white/80 text-center mt-1 relative z-10">Real AI evaluation</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Import Zone */}
        <div id="import-zone" className="max-w-xl w-full mt-12 scroll-mt-24">
          <FileDropZone compact={false} />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mt-16">
          <FeatureCard
            icon={
              <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            }
            title="Guided Wizard"
            description="7 simple steps — personal info, links, education, certifications, projects, skills, and review."
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="Live Preview"
            description="See your resume update in real time as you type. What you see is what you get."
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
            title="One-Page Guarantee"
            description="Auto-adjusts layout to fit one page. Never worry about overflow or formatting."
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            }
            title="Template Gallery"
            description="Choose from 3 professional resume templates — Classic, Modern, or Bold — and switch instantly."
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            }
            title="Smart Import"
            description="Drop your existing resume (PDF, Word, or text) and AI fills in every field automatically."
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
            title="Secure & Private"
            description="Your data stays in your browser. Sign in with Google for seamless access or use as a guest."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E4DF] py-6">
        <p className="text-center text-xs text-[#6B6B63]">
          Built with care. RESUMEMAKER — No data leaves your browser unless you log in.
        </p>
      </footer>

      {/* Modals */}
      <ATSCheckerModal 
        isOpen={isAtsModalOpen} 
        onClose={() => setIsAtsModalOpen(false)} 
      />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-[#E4E4DF] rounded-[6px] p-5 text-left hover:shadow-sm transition-shadow">
      {icon && <div className="mb-3">{icon}</div>}
      <h3
        className="text-sm font-semibold text-[#1C1C1A] mb-1.5"
        style={{ fontFamily: 'var(--font-plex-sans)' }}
      >
        {title}
      </h3>
      <p className="text-sm text-[#6B6B63] leading-relaxed">{description}</p>
    </div>
  );
}
