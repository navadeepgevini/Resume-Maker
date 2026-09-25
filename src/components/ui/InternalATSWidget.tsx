'use client';

import React, { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { auth } from '@/lib/firebase';

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

export default function InternalATSWidget() {
  const { state, dispatch } = useResume();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreData | null>(null);
  
  // Use state.jobDescription if it exists, otherwise empty
  // (We'll assume state.targetJobDescription exists in context)
  const jobDescription = state.targetJobDescription || '';

  const handleScan = async () => {
    setError(null);
    setIsScanning(true);
    setResult(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Format state as text
      const resumeText = JSON.stringify({
        personal: state.personal,
        education: state.education,
        experience: state.experience,
        projects: state.projects,
        skills: state.skills,
        certifications: state.certifications,
      }, null, 2);

      const formData = new FormData();
      formData.append('resumeText', resumeText);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E4E4DF] p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1C1C1A]">Live ATS Score</h3>
        {result && (
          <span
            className="text-lg font-bold"
            style={{ color: getScoreColor(result.totalScore) }}
          >
            {result.totalScore}/100
          </span>
        )}
      </div>

      {!result && !isScanning && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1C1C1A] mb-1">
              Target Job Description (Optional)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => dispatch({ type: 'SET_JOB_DESCRIPTION', payload: e.target.value })}
              placeholder="Paste the job description here..."
              className="w-full h-24 p-2 border border-[#E4E4DF] rounded-md focus:outline-none focus:ring-1 focus:ring-[#33415C] text-xs text-[#1C1C1A] resize-none"
            />
          </div>
          <button
            onClick={handleScan}
            className="w-full py-2 bg-[#33415C] text-white rounded-lg text-sm font-medium hover:bg-[#253046] transition-colors"
          >
            Scan Resume
          </button>
        </div>
      )}

      {isScanning && (
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#33415C]/20 border-t-[#33415C] rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-[#6B6B63] text-center">
            Analyzing keywords and formatting...
          </p>
        </div>
      )}

      {error && !isScanning && (
        <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs">
          <span className="font-medium">Error:</span> {error}
          <button onClick={() => setError(null)} className="block mt-1 underline hover:text-red-900">Try again</button>
        </div>
      )}

      {result && !isScanning && (
        <div className="space-y-4 animate-[fadeIn_300ms_ease-out]">
          <div className="space-y-3">
            {result.categories.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[#1C1C1A] text-xs">{cat.label}</span>
                  <span className="text-xs font-semibold" style={{ color: getScoreColor((cat.score / cat.maxScore) * 100) }}>
                    {cat.score}/{cat.maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(cat.score / cat.maxScore) * 100}%`, backgroundColor: getScoreColor((cat.score / cat.maxScore) * 100) }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#6B6B63] mt-1 leading-snug">{cat.feedback}</p>
              </div>
            ))}
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="pt-2 border-t border-[#E4E4DF]">
              <h4 className="text-xs font-semibold text-[#1C1C1A] mb-2">Suggestions</h4>
              <ul className="space-y-1.5">
                {result.suggestions.slice(0, 2).map((suggestion, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-[#4A4A43]">
                    <span className="text-[#33415C] shrink-0">•</span>
                    <span className="leading-tight">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-1.5 border border-[#E4E4DF] text-[#1C1C1A] rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Edit JD
            </button>
            <button
              onClick={handleScan}
              className="flex-1 py-1.5 bg-[#33415C] text-white rounded-md text-xs font-medium hover:bg-[#253046] transition-colors"
            >
              Rescan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
