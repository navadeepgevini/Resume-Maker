'use client';

import { useCallback, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SortableList } from '@/components/ui/SortableList';
import { RichTextInput } from '@/components/ui/RichTextInput';
import type { ExperienceEntry } from '@/types/resume';

interface AIRewriteState {
  loading: boolean;
  suggestions: string[];
  error: string | null;
}

function bulletKey(experienceId: string, index: number): string {
  return `${experienceId}-${index}`;
}

function createExperience(): ExperienceEntry {
  return {
    id: crypto.randomUUID(),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: ['', ''],
  };
}

export default function StepExperience() {
  const { state, dispatch } = useResume();
  const experiences = state.experience;
  const [aiState, setAiState] = useState<Record<string, AIRewriteState>>({});

  const setExperiences = useCallback(
    (updated: ExperienceEntry[]) => {
      dispatch({ type: 'SET_EXPERIENCE', payload: updated });
    },
    [dispatch],
  );

  const addExperience = () => setExperiences([...experiences, createExperience()]);

  const removeExperience = (id: string) =>
    setExperiences(experiences.filter((e) => e.id !== id));

  const updateExperience = (
    id: string,
    field: keyof ExperienceEntry,
    value: string | string[],
  ) => {
    setExperiences(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const updateBullet = (id: string, index: number, value: string) => {
    setExperiences(
      experiences.map((e) => {
        if (e.id !== id) return e;
        const bullets = [...e.bullets];
        bullets[index] = value;
        return { ...e, bullets };
      }),
    );
  };

  const rewriteBullet = async (experience: ExperienceEntry, index: number) => {
    const bullet = experience.bullets[index]?.trim();
    if (!bullet) return;
    const key = bulletKey(experience.id, index);

    setAiState((prev) => ({ ...prev, [key]: { loading: true, suggestions: [], error: null } }));

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet,
          projectName: experience.company,
          techStack: [experience.role],
          jobDescription: state.targetJobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get suggestions.');

      setAiState((prev) => ({
        ...prev,
        [key]: { loading: false, suggestions: data.suggestions ?? [], error: null },
      }));
    } catch (err: unknown) {
      setAiState((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          suggestions: [],
          error: err instanceof Error ? err.message : 'Something went wrong.',
        },
      }));
    }
  };

  const applySuggestion = (experienceId: string, index: number, suggestion: string) => {
    updateBullet(experienceId, index, suggestion);
    setAiState((prev) => ({ ...prev, [bulletKey(experienceId, index)]: { loading: false, suggestions: [], error: null } }));
  };

  const dismissSuggestions = (experienceId: string, index: number) => {
    setAiState((prev) => ({ ...prev, [bulletKey(experienceId, index)]: { loading: false, suggestions: [], error: null } }));
  };

  const addBullet = (id: string) => {
    setAiState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}-`)) delete next[k]; });
      return next;
    });
    setExperiences(
      experiences.map((e) => {
        if (e.id !== id || e.bullets.length >= 6) return e;
        return { ...e, bullets: [...e.bullets, ''] };
      }),
    );
  };

  const removeBullet = (id: string, index: number) => {
    setAiState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}-`)) delete next[k]; });
      return next;
    });
    setExperiences(
      experiences.map((e) => {
        if (e.id !== id || e.bullets.length <= 1) return e;
        return { ...e, bullets: e.bullets.filter((_, i) => i !== index) };
      }),
    );
  };

  const handleReorder = (reordered: ExperienceEntry[]) => setExperiences(reordered);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Work Experience
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Add your professional job history, internships, or relevant volunteer experience.
        </p>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#E4E4DF] rounded-[6px]">
          <p className="text-sm text-[#6B6B63] mb-3">No work experience yet</p>
          <Button variant="primary" onClick={addExperience}>
            + Add Experience
          </Button>
        </div>
      ) : (
        <>
          <SortableList
            items={experiences}
            onReorder={handleReorder}
            renderItem={(experience, dragHandle) => (
              <div className="bg-white border border-[#E4E4DF] rounded-[6px] p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {dragHandle}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        id={`exp-company-${experience.id}`}
                        label="Company / Organization"
                        required
                        value={experience.company}
                        onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                        placeholder="e.g. Acme Corp"
                      />
                      <Input
                        id={`exp-role-${experience.id}`}
                        label="Job Title / Role"
                        required
                        value={experience.role}
                        onChange={(e) => updateExperience(experience.id, 'role', e.target.value)}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        id={`exp-loc-${experience.id}`}
                        label="Location"
                        value={experience.location}
                        onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                        placeholder="e.g. New York, NY"
                      />
                      <Input
                        id={`exp-start-${experience.id}`}
                        label="Start Date"
                        value={experience.startDate}
                        onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                        placeholder="e.g. Jun 2021"
                      />
                      <Input
                        id={`exp-end-${experience.id}`}
                        label="End Date"
                        value={experience.endDate}
                        onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                        placeholder="e.g. Present"
                      />
                    </div>

                    {/* Bullet points */}
                    <div className="space-y-2 pt-2 border-t border-[#E4E4DF]">
                      <label className="block text-sm font-medium text-[#1C1C1A]">
                        Responsibilities & Achievements ({experience.bullets.length}/6)
                      </label>
                      {experience.bullets.map((bullet, i) => {
                        const key = bulletKey(experience.id, i);
                        const reactKey = `${experience.id}-bullet-${i}-${bullet.length}`;
                        const ai = aiState[key];
                        return (
                          <div key={reactKey} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6B6B63] w-4">•</span>
                              <RichTextInput
                                value={bullet}
                                onChange={(val) => updateBullet(experience.id, i, val)}
                                placeholder={`Responsibility #${i + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => rewriteBullet(experience, i)}
                                disabled={!bullet.trim() || ai?.loading}
                                className="shrink-0 flex items-center gap-1 text-xs font-medium text-[#33415C] hover:bg-[#33415C]/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-[4px] px-2 py-1.5 transition-colors"
                                title="Improve with AI"
                              >
                                {ai?.loading ? (
                                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <span aria-hidden>✨</span>
                                )}
                                <span className="hidden sm:inline">Improve</span>
                              </button>
                              {experience.bullets.length > 1 && (
                                <button
                                  onClick={() => removeBullet(experience.id, i)}
                                  className="text-[#6B6B63] hover:text-[#B91C1C] p-1"
                                  aria-label="Remove bullet"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {ai?.error && (
                              <p className="ml-6 text-xs text-[#B91C1C]">{ai.error}</p>
                            )}

                            {ai && ai.suggestions.length > 0 && (
                              <div className="ml-6 space-y-1.5 rounded-[6px] border border-[#33415C]/20 bg-[#33415C]/5 p-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#33415C]">AI Suggestions</span>
                                  <button
                                    type="button"
                                    onClick={() => dismissSuggestions(experience.id, i)}
                                    className="text-[10px] text-[#6B6B63] hover:text-[#1C1C1A]"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                                {ai.suggestions.map((s, si) => (
                                  <button
                                    key={si}
                                    type="button"
                                    onClick={() => applySuggestion(experience.id, i, s)}
                                    className="block w-full text-left text-xs text-[#1C1C1A] bg-white border border-[#E4E4DF] hover:border-[#33415C] rounded-[4px] px-2.5 py-1.5 transition-colors"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {experience.bullets.length < 6 && (
                        <button
                          onClick={() => addBullet(experience.id)}
                          className="text-xs text-[#33415C] hover:underline"
                        >
                          + Add bullet point
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeExperience(experience.id)}
                    className="text-[#6B6B63] hover:text-[#B91C1C] p-1 transition-colors"
                    aria-label={`Remove ${experience.company || 'experience'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          />
          <Button variant="secondary" onClick={addExperience}>
            + Add Experience
          </Button>
        </>
      )}
    </div>
  );
}
