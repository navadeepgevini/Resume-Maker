'use client';

import { useCallback, useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChipInput } from '@/components/ui/ChipInput';
import { Toggle } from '@/components/ui/Toggle';
import { SortableList } from '@/components/ui/SortableList';
import { RichTextInput } from '@/components/ui/RichTextInput';
import { MAX_FEATURED_PROJECTS } from '@/lib/constants';
import type { ProjectEntry, GitHubRepo } from '@/types/resume';

interface AIRewriteState {
  loading: boolean;
  suggestions: string[];
  error: string | null;
}

function bulletKey(projectId: string, index: number): string {
  return `${projectId}-${index}`;
}

function createProject(): ProjectEntry {
  return {
    id: crypto.randomUUID(),
    name: '',
    techStack: [],
    bullets: ['', ''],
    repoLink: '',
    liveLink: '',
    featured: false,
    importedFromGitHub: false,
  };
}

export default function StepProjects() {
  const { state, dispatch, githubRepos } = useResume();
  const projects = state.projects;
  const [showGitHub, setShowGitHub] = useState(false);
  const [aiState, setAiState] = useState<Record<string, AIRewriteState>>({});

  const featuredCount = projects.filter((p) => p.featured).length;

  const setProjects = useCallback(
    (updated: ProjectEntry[]) => {
      dispatch({ type: 'SET_PROJECTS', payload: updated });
    },
    [dispatch],
  );

  const addProject = () => setProjects([...projects, createProject()]);

  const removeProject = (id: string) =>
    setProjects(projects.filter((p) => p.id !== id));

  const updateProject = (
    id: string,
    field: keyof ProjectEntry,
    value: string | string[] | boolean,
  ) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const updateBullet = (id: string, index: number, value: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id !== id) return p;
        const bullets = [...p.bullets];
        bullets[index] = value;
        return { ...p, bullets };
      }),
    );
  };

  const rewriteBullet = async (project: ProjectEntry, index: number) => {
    const bullet = project.bullets[index]?.trim();
    if (!bullet) return;
    const key = bulletKey(project.id, index);

    setAiState((prev) => ({ ...prev, [key]: { loading: true, suggestions: [], error: null } }));

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet,
          projectName: project.name,
          techStack: project.techStack,
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

  const applySuggestion = (projectId: string, index: number, suggestion: string) => {
    updateBullet(projectId, index, suggestion);
    setAiState((prev) => ({ ...prev, [bulletKey(projectId, index)]: { loading: false, suggestions: [], error: null } }));
  };

  const dismissSuggestions = (projectId: string, index: number) => {
    setAiState((prev) => ({ ...prev, [bulletKey(projectId, index)]: { loading: false, suggestions: [], error: null } }));
  };

  const addBullet = (id: string) => {
    setAiState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}-`)) delete next[k]; });
      return next;
    });
    setProjects(
      projects.map((p) => {
        if (p.id !== id || p.bullets.length >= 3) return p;
        return { ...p, bullets: [...p.bullets, ''] };
      }),
    );
  };

  const removeBullet = (id: string, index: number) => {
    setAiState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}-`)) delete next[k]; });
      return next;
    });
    setProjects(
      projects.map((p) => {
        if (p.id !== id || p.bullets.length <= 1) return p;
        return { ...p, bullets: p.bullets.filter((_, i) => i !== index) };
      }),
    );
  };

  const toggleFeatured = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    if (!project.featured && featuredCount >= MAX_FEATURED_PROJECTS) return;

    updateProject(id, 'featured', !project.featured);
  };

  const importFromGitHub = (repo: GitHubRepo) => {
    if (projects.some((p) => p.repoLink === repo.html_url)) {
      return; // Already imported
    }
    const newProject: ProjectEntry = {
      id: crypto.randomUUID(),
      name: repo.name,
      techStack: repo.language ? [repo.language] : [],
      bullets: ['', ''],
      repoLink: repo.html_url,
      liveLink: '',
      featured: false,
      importedFromGitHub: true,
    };
    setProjects([...projects, newProject]);
  };

  const handleReorder = (reordered: ProjectEntry[]) => setProjects(reordered);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Projects
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Add your projects. Mark up to {MAX_FEATURED_PROJECTS} as featured — only featured projects appear on the resume.
        </p>
      </div>

      {/* GitHub Import Panel */}
      {githubRepos.length > 0 && (
        <div className="border border-[#E4E4DF] rounded-[6px] overflow-hidden">
          <button
            onClick={() => setShowGitHub(!showGitHub)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#FAFAF9] transition-colors text-left"
          >
            <span className="text-sm font-medium text-[#33415C]">
              Import from GitHub ({githubRepos.length} repos)
            </span>
            <svg
              className={`w-4 h-4 text-[#6B6B63] transition-transform ${showGitHub ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showGitHub && (
            <div className="border-t border-[#E4E4DF] max-h-48 overflow-y-auto">
              {githubRepos.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between px-4 py-2 hover:bg-[#FAFAF9] border-b border-[#E4E4DF] last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#1C1C1A] truncate block">
                      {repo.name}
                    </span>
                    {repo.language && (
                      <span className="text-xs font-mono text-[#6B6B63]">{repo.language}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => importFromGitHub(repo)}
                    className="text-xs"
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Cards */}
      {projects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[#E4E4DF] rounded-[6px]">
          <p className="text-sm text-[#6B6B63] mb-3">No projects yet</p>
          <Button variant="primary" onClick={addProject}>
            + Add Project
          </Button>
        </div>
      ) : (
        <>
          <SortableList
            items={projects}
            onReorder={handleReorder}
            renderItem={(project, dragHandle) => (
              <div
                className={`bg-white border rounded-[6px] p-4 space-y-3 ${
                  project.featured ? 'border-[#33415C]' : 'border-[#E4E4DF]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {dragHandle}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        id={`proj-name-${project.id}`}
                        label="Project Name"
                        required
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        placeholder="RESUMEMAKER"
                      />
                      <div>
                        <ChipInput
                          id={`proj-tech-${project.id}`}
                          label="Tech Stack"
                          chips={project.techStack}
                          onChipsChange={(chips) => updateProject(project.id, 'techStack', chips)}
                          placeholder="Type and press Enter"
                        />
                      </div>
                    </div>

                    {/* Bullet points */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#1C1C1A]">
                        Bullet Points ({project.bullets.length}/3)
                      </label>
                      {project.bullets.map((bullet, i) => {
                        const key = bulletKey(project.id, i);
                        const reactKey = `${project.id}-bullet-${i}-${bullet.length}`;
                        const ai = aiState[key];
                        return (
                          <div key={reactKey} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6B6B63] w-4">•</span>
                              <RichTextInput
                                value={bullet}
                                onChange={(val) => updateBullet(project.id, i, val)}
                                placeholder={`Achievement or outcome #${i + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => rewriteBullet(project, i)}
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
                              {project.bullets.length > 1 && (
                                <button
                                  onClick={() => removeBullet(project.id, i)}
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
                                    onClick={() => dismissSuggestions(project.id, i)}
                                    className="text-[10px] text-[#6B6B63] hover:text-[#1C1C1A]"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                                {ai.suggestions.map((s, si) => (
                                  <button
                                    key={si}
                                    type="button"
                                    onClick={() => applySuggestion(project.id, i, s)}
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
                      {project.bullets.length < 3 && (
                        <button
                          onClick={() => addBullet(project.id)}
                          className="text-xs text-[#33415C] hover:underline"
                        >
                          + Add bullet point
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        id={`proj-repo-${project.id}`}
                        label="Repo Link"
                        type="url"
                        value={project.repoLink}
                        onChange={(e) => updateProject(project.id, 'repoLink', e.target.value)}
                        placeholder="https://github.com/..."
                      />
                      <Input
                        id={`proj-live-${project.id}`}
                        label="Live Demo"
                        type="url"
                        value={project.liveLink}
                        onChange={(e) => updateProject(project.id, 'liveLink', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    {/* Featured toggle */}
                    <div className="flex items-center gap-3">
                      <Toggle
                        id={`proj-featured-${project.id}`}
                        label="Feature on resume"
                        checked={project.featured}
                        onChange={() => toggleFeatured(project.id)}
                      />
                      {!project.featured &&
                        featuredCount >= MAX_FEATURED_PROJECTS && (
                          <span className="text-xs text-[#B91C1C]">
                            Maximum {MAX_FEATURED_PROJECTS} featured. Unfeature one to add another.
                          </span>
                        )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-[#6B6B63] hover:text-[#B91C1C] p-1 transition-colors"
                    aria-label={`Remove ${project.name || 'project'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          />
          <Button variant="secondary" onClick={addProject}>
            + Add Project
          </Button>
        </>
      )}

      {projects.length > 0 && (
        <p className="text-xs text-[#6B6B63]">
          {featuredCount} of {MAX_FEATURED_PROJECTS} featured slots used. Only featured projects appear on your resume.
        </p>
      )}
    </div>
  );
}
