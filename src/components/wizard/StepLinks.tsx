'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/Input';
import { validateURL } from '@/lib/validators';

export default function StepLinks() {
  const { state, dispatch, setGithubRepos, setIsGithubLoading, isGithubLoading, githubRepos } =
    useResume();
  const links = state.links;

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [githubStatus, setGithubStatus] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const update = useCallback(
    (field: string, value: string) => {
      dispatch({
        type: 'SET_LINKS',
        payload: { [field]: value },
      });
    },
    [dispatch],
  );

  const validateURLField = useCallback((field: string, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }
    const result = validateURL(value, field);
    setErrors((prev) => ({
      ...prev,
      [field]: result.valid ? undefined : result.message,
    }));
  }, []);

  // Fetch GitHub repos when username changes (debounced)
  useEffect(() => {
    const username = links.github?.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!username) {
        setGithubStatus('');
        setGithubRepos([]);
        return;
      }

      setIsGithubLoading(true);
      setGithubStatus('Fetching repositories…');

      try {
        const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const repos = await res.json();
        setGithubRepos(repos);
        setGithubStatus(`Found ${repos.length} public repositories`);
      } catch {
        setGithubStatus('Could not fetch repos — you can add projects manually');
        setGithubRepos([]);
      } finally {
        setIsGithubLoading(false);
      }
    }, username ? 800 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [links.github, setGithubRepos, setIsGithubLoading]);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Links & Coding Profiles
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Add your online presence. All fields are optional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="links-linkedin"
          label="LinkedIn URL"
          type="url"
          value={links.linkedin ?? ''}
          onChange={(e) => update('linkedin', e.target.value)}
          onBlur={(e) => validateURLField('linkedin', e.target.value)}
          error={errors.linkedin}
          placeholder="https://linkedin.com/in/johndoe"
        />

        <div>
          <Input
            id="links-github"
            label="GitHub Username"
            value={links.github ?? ''}
            onChange={(e) => update('github', e.target.value)}
            placeholder="johndoe"
            helperText={
              isGithubLoading
                ? 'Fetching repos…'
                : githubStatus || 'We\'ll pull your repos for easy project import'
            }
          />
          {githubRepos.length > 0 && (
            <p className="mt-1 text-xs text-green-700">
              ✓ {githubRepos.length} repos available for import in the Projects step
            </p>
          )}
        </div>

        <Input
          id="links-leetcode"
          label="LeetCode URL"
          type="url"
          value={links.leetcode ?? ''}
          onChange={(e) => update('leetcode', e.target.value)}
          onBlur={(e) => validateURLField('leetcode', e.target.value)}
          error={errors.leetcode}
          placeholder="https://leetcode.com/johndoe"
        />

        <Input
          id="links-codeforces"
          label="Codeforces URL"
          type="url"
          value={links.codeforces ?? ''}
          onChange={(e) => update('codeforces', e.target.value)}
          onBlur={(e) => validateURLField('codeforces', e.target.value)}
          error={errors.codeforces}
          placeholder="https://codeforces.com/profile/johndoe"
        />

        <Input
          id="links-hackerrank"
          label="HackerRank URL"
          type="url"
          value={links.hackerrank ?? ''}
          onChange={(e) => update('hackerrank', e.target.value)}
          onBlur={(e) => validateURLField('hackerrank', e.target.value)}
          error={errors.hackerrank}
          placeholder="https://hackerrank.com/johndoe"
        />

        <Input
          id="links-personalSite"
          label="Personal Website"
          type="url"
          value={links.personalSite ?? ''}
          onChange={(e) => update('personalSite', e.target.value)}
          onBlur={(e) => validateURLField('personalSite', e.target.value)}
          error={errors.personalSite}
          placeholder="https://johndoe.dev"
        />
      </div>
    </div>
  );
}
