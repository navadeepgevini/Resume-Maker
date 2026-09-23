'use client';

import { useCallback } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SortableList } from '@/components/ui/SortableList';
import type { CertificationEntry } from '@/types/resume';

function createEntry(): CertificationEntry {
  return {
    id: crypto.randomUUID(),
    title: '',
    issuer: '',
    completionDate: '',
  };
}

export default function StepCertifications() {
  const { state, dispatch } = useResume();
  const entries = state.certifications;

  const setEntries = useCallback(
    (updated: CertificationEntry[]) => {
      dispatch({ type: 'SET_CERTIFICATIONS', payload: updated });
    },
    [dispatch],
  );

  const addEntry = () => setEntries([...entries, createEntry()]);

  const removeEntry = (id: string) =>
    setEntries(entries.filter((e) => e.id !== id));

  const updateEntry = (id: string, field: keyof CertificationEntry, value: string) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleReorder = (reordered: CertificationEntry[]) => setEntries(reordered);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Certifications
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Add relevant certifications. This step is optional — skip if you have none.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#E4E4DF] rounded-[6px]">
          <p className="text-sm text-[#6B6B63] mb-3">No certifications added yet</p>
          <Button variant="secondary" onClick={addEntry}>
            + Add Certification
          </Button>
        </div>
      ) : (
        <>
          <SortableList
            items={entries}
            onReorder={handleReorder}
            renderItem={(entry, dragHandle) => (
              <div className="bg-white border border-[#E4E4DF] rounded-[6px] p-4">
                <div className="flex items-start justify-between gap-2">
                  {dragHandle}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      id={`cert-title-${entry.id}`}
                      label="Title"
                      required
                      value={entry.title}
                      onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                      placeholder="AWS Cloud Practitioner"
                    />
                    <Input
                      id={`cert-issuer-${entry.id}`}
                      label="Issuing Organization"
                      required
                      value={entry.issuer}
                      onChange={(e) => updateEntry(entry.id, 'issuer', e.target.value)}
                      placeholder="Amazon Web Services"
                    />
                    <Input
                      id={`cert-date-${entry.id}`}
                      label="Completion Date"
                      type="date"
                      value={entry.completionDate}
                      onChange={(e) => updateEntry(entry.id, 'completionDate', e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-[#6B6B63] hover:text-[#B91C1C] p-1 transition-colors"
                    aria-label={`Remove ${entry.title || 'certification'}`}
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
