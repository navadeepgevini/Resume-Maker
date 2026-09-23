'use client';

import { useCallback, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/Button';
import { ChipInput } from '@/components/ui/ChipInput';
import type { SkillCategory } from '@/types/resume';

export default function StepSkills() {
  const { state, dispatch } = useResume();
  const categories = state.skills;

  const setCategories = useCallback(
    (updated: SkillCategory[]) => {
      dispatch({ type: 'SET_SKILLS', payload: updated });
    },
    [dispatch],
  );

  const updateCategory = (id: string, field: keyof SkillCategory, value: string | string[]) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      { id: crypto.randomUUID(), name: 'New Category', skills: [] },
    ]);
  };

  const removeCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat.skills.length > 0) return; // Don't remove non-empty categories
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Skills
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Organize your skills by category. Click a category name to rename it.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-[#E4E4DF] rounded-[6px] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <CategoryName
                value={cat.name}
                onChange={(name) => updateCategory(cat.id, 'name', name)}
              />
              {cat.skills.length === 0 && (
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="text-xs text-[#6B6B63] hover:text-[#B91C1C] transition-colors"
                  aria-label={`Remove ${cat.name} category`}
                >
                  Remove
                </button>
              )}
            </div>
            <ChipInput
              id={`skills-${cat.id}`}
              label=""
              chips={cat.skills}
              onChipsChange={(skills) => updateCategory(cat.id, 'skills', skills)}
              placeholder={`Add ${cat.name.toLowerCase()} skills…`}
            />
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={addCategory}>
        + Add Category
      </Button>
    </div>
  );
}

/** Inline-editable category name */
function CategoryName({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Keep draft in sync if value changes externally (e.g., from reset or import)
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="text-sm font-semibold text-[#1C1C1A] border-b border-[#33415C] bg-transparent outline-none px-0 py-0.5"
        style={{ fontFamily: 'var(--font-plex-sans)' }}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="text-sm font-semibold text-[#1C1C1A] hover:text-[#33415C] transition-colors cursor-pointer"
      style={{ fontFamily: 'var(--font-plex-sans)' }}
      title="Click to rename"
    >
      {value}
    </button>
  );
}
