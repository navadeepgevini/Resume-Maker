'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Modal } from '@/components/ui/Modal';

interface ATSCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScoreData {
  totalScore: number;
  categories: {
    label: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  suggestions: string[];
}

export default function ATSCheckerModal({ isOpen, onClose }: ATSCheckerModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreData | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large (max 5MB).');
      return;
    }

    setError(null);
    setIsScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription.trim());
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan resume.');
      }

      setResult(data.scoreData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  // Color logic for circular gauge
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Real ATS Score Check" maxWidth="2xl">
      <div className="flex-1 w-full">
          {!result && !isScanning && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1A] mb-2">
                  Target Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to see how well your resume matches the required keywords and skills..."
                  className="w-full h-32 p-3 border border-[#E4E4DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33415C] text-sm text-[#1C1C1A] resize-none"
                />
              </div>
              <div
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-[#33415C] bg-[#33415C]/5' : 'border-[#E4E4DF] hover:border-[#33415C] hover:bg-gray-50'
                }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 mb-4 rounded-full bg-[#33415C]/10 flex items-center justify-center text-[#33415C]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1C1C1A] mb-1">Drop your resume here</h3>
              <p className="text-sm text-[#6B6B63]">Supports PDF, DOCX, or TXT (Max 5MB)</p>
            </div>
            </div>
          )}

          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#33415C]/20 border-t-[#33415C] rounded-full animate-spin mb-6"></div>
              <h3 className="text-lg font-medium text-[#1C1C1A] mb-2">AI is evaluating your resume...</h3>
              <p className="text-sm text-[#6B6B63] text-center max-w-sm">
                Scanning for keywords, formatting, action verbs, and quantifiable impact. This might take a few seconds.
              </p>
            </div>
          )}

          {error && !isScanning && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              <span className="font-medium">Error:</span> {error}
              <button onClick={reset} className="block mt-2 underline hover:text-red-900">Try again</button>
            </div>
          )}

          {result && (
            <div className="space-y-8 animate-[fadeIn_300ms_ease-out]">
              {/* Overall Score */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center w-40 h-40">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-gray-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress circle */}
                    <path
                      stroke={getScoreColor(result.totalScore)}
                      strokeWidth="3"
                      strokeDasharray={`${result.totalScore}, 100`}
                      fill="none"
                      strokeLinecap="round"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold text-[#1C1C1A]" style={{ fontFamily: 'var(--font-plex-sans)' }}>
                      {result.totalScore}
                    </span>
                    <span className="text-xs font-medium text-[#6B6B63] uppercase tracking-wider mt-1">out of 100</span>
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-medium text-[#1C1C1A]">
                  {result.totalScore >= 80 ? 'Excellent!' : result.totalScore >= 60 ? 'Needs Improvement' : 'Requires Major Rewrite'}
                </h3>
                <p className="text-sm text-[#6B6B63] mt-1 max-w-sm">
                  {result.totalScore >= 80 
                    ? "Your resume is highly optimized for Applicant Tracking Systems." 
                    : "Your resume might get filtered out by standard ATS software."}
                </p>
              </div>

              <hr className="border-[#E4E4DF]" />

              {/* Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-[#1C1C1A] uppercase tracking-wider mb-4">Category Breakdown</h4>
                <div className="space-y-4">
                  {result.categories.map((cat, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 border border-[#E4E4DF]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#1C1C1A] text-sm">{cat.label}</span>
                        <span className="text-sm font-semibold" style={{ color: getScoreColor((cat.score / cat.maxScore) * 100) }}>
                          {cat.score} / {cat.maxScore}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B6B63] leading-snug">{cat.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#1C1C1A] uppercase tracking-wider mb-3">Actionable Feedback</h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-3 text-sm text-[#4A4A43]">
                        <svg className="w-5 h-5 text-[#33415C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="bg-[#33415C]/5 border border-[#33415C]/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div>
                  <h4 className="font-medium text-[#1C1C1A]">Want to fix these issues?</h4>
                  <p className="text-sm text-[#6B6B63]">Import this resume into our builder and let AI help you rewrite it.</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white shadow hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  Import & Build →
                </Link>
              </div>
              
              <div className="text-center pb-2">
                 <button onClick={reset} className="text-sm text-[#6B6B63] hover:text-[#1C1C1A] underline">Check another resume</button>
              </div>
            </div>
          )}
      </div>
    </Modal>
  );
}
