'use client';

import { useCallback } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { SortableList } from '@/components/ui/SortableList';
import type { EducationEntry } from '@/types/resume';

function createEntry(): EducationEntry {
  return {
    id: crypto.randomUUID(),
    institution: '',
    degree: '',
    startYear: '',
    endYear: '',
    gradeType: 'cgpa',
    gradeValue: '',
  };
}

export default function StepEducation() {
  const { state, dispatch } = useResume();
  const entries = state.education;

  const setEntries = useCallback(
    (updated: EducationEntry[]) => {
      dispatch({ type: 'SET_EDUCATION', payload: updated });
    },
    [dispatch],
  );

  const addEntry = () => setEntries([...entries, createEntry()]);

  const removeEntry = (id: string) =>
    setEntries(entries.filter((e) => e.id !== id));

  const updateEntry = (id: string, field: keyof EducationEntry, value: string | boolean) => {
    setEntries(
      entries.map((e) =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    );
  };

  const handleReorder = (reordered: EducationEntry[]) => setEntries(reordered);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Education
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Add your educational background. Drag to reorder.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#E4E4DF] rounded-[6px]">
          <p className="text-sm text-[#6B6B63] mb-3">No entries yet</p>
          <Button variant="primary" onClick={addEntry}>
            + Add Education
          </Button>
        </div>
      ) : (
        <>
          <SortableList
            items={entries}
            onReorder={handleReorder}
            renderItem={(entry, dragHandle) => (
              <div className="bg-white border border-[#E4E4DF] rounded-[6px] p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {dragHandle}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      id={`edu-institution-${entry.id}`}
                      label="Institution"
                      required
                      value={entry.institution}
                      onChange={(e) => updateEntry(entry.id, 'institution', e.target.value)}
                      placeholder="Stanford University"
                    />
                    <Input
                      id={`edu-degree-${entry.id}`}
                      label="Degree / Branch"
                      required
                      value={entry.degree}
                      onChange={(e) => updateEntry(entry.id, 'degree', e.target.value)}
                      placeholder="B.S. Computer Science"
                    />
                    <Input
                      id={`edu-startYear-${entry.id}`}
                      label="Start Year"
                      required
                      value={entry.startYear}
                      onChange={(e) => updateEntry(entry.id, 'startYear', e.target.value)}
                      placeholder="2020"
                    />
                    <div className="space-y-1">
                      <Input
                        id={`edu-endYear-${entry.id}`}
                        label="End Year"
                        required
                        value={entry.endYear}
                        onChange={(e) => updateEntry(entry.id, 'endYear', e.target.value)}
                        placeholder="2024 or Present"
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Input
                          id={`edu-grade-${entry.id}`}
                          label="Grade"
                          value={entry.gradeValue}
                          onChange={(e) => updateEntry(entry.id, 'gradeValue', e.target.value)}
                          placeholder={entry.gradeType === 'cgpa' ? '9.2' : '92'}
                        />
                      </div>
                      <Toggle
                        id={`edu-gradeType-${entry.id}`}
                        label={entry.gradeType === 'cgpa' ? 'CGPA / 10' : 'Percentage'}
                        checked={entry.gradeType === 'percentage'}
                        onChange={(checked) =>
                          updateEntry(entry.id, 'gradeType', checked ? 'percentage' : 'cgpa')
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-[#6B6B63] hover:text-[#B91C1C] p-1 transition-colors"
                    aria-label={`Remove ${entry.institution || 'entry'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          />
          <Button variant="secondary" onClick={addEntry}>
            + Add Another
          </Button>
        </>
      )}
    </div>
  );
}
