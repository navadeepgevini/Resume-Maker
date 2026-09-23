'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import type {
  ResumeData,
  PersonalDetails,
  LinksAndProfiles,
  EducationEntry,
  CertificationEntry,
  ProjectEntry,
  SkillCategory,
  ResumeSettings,
  GitHubRepo,
  WizardStep,
} from '@/types/resume';
import { STORAGE_KEY, DEFAULT_SKILL_CATEGORIES } from '@/lib/constants';

// ---- Default Data ----

const defaultPersonal: PersonalDetails = {
  fullName: '',
  headline: '',
  phone: '',
  email: '',
  cityState: '',
  dateOfBirth: '',
  showDOB: false,
  photo: '',
  showPhoto: true,
};

const defaultLinks: LinksAndProfiles = {
  linkedin: '',
  github: '',
  leetcode: '',
  codeforces: '',
  hackerrank: '',
  personalSite: '',
};

const defaultSettings: ResumeSettings = {
  pageSize: 'letter',
  showPhoto: true,
  template: 'classic',
};

const defaultSkills: SkillCategory[] = DEFAULT_SKILL_CATEGORIES.map((name, i) => ({
  id: `skill-${i}`,
  name,
  skills: [],
}));

export const defaultResumeData: ResumeData = {
  personal: defaultPersonal,
  links: defaultLinks,
  education: [],
  certifications: [],
  projects: [],
  skills: defaultSkills,
  settings: defaultSettings,
};

// ---- Step Validation ----
// Each step is "complete" only when its required fields contain actual valid data.

function isStepComplete(step: number, data: ResumeData): boolean {
  switch (step) {
    case 1: // Personal — require name, email, and phone at minimum
      return !!(
        data.personal.fullName?.trim() &&
        data.personal.email?.trim() &&
        data.personal.phone?.trim()
      );
    case 2: // Links — at least one link filled in
      return !!(
        data.links.linkedin?.trim() ||
        data.links.github?.trim() ||
        data.links.leetcode?.trim() ||
        data.links.codeforces?.trim() ||
        data.links.hackerrank?.trim() ||
        data.links.personalSite?.trim()
      );
    case 3: // Education — at least one entry with institution and degree
      return data.education.length > 0 &&
        data.education.some(e => e.institution?.trim() && e.degree?.trim());
    case 4: // Certifications — optional step, always consider complete
      return true;
    case 5: // Projects — at least one project with name
      return data.projects.length > 0 &&
        data.projects.some(p => p.name?.trim());
    case 6: // Skills — at least one category with at least one skill
      return data.skills.some(cat => cat.skills.length > 0);
    case 7: // Review — always "not completable" (it's the final step, not a data entry step)
      return false;
    default:
      return false;
  }
}

// ---- Action Types ----

type ResumeAction =
  | { type: 'SET_PERSONAL'; payload: Partial<PersonalDetails> }
  | { type: 'SET_LINKS'; payload: Partial<LinksAndProfiles> }
  | { type: 'SET_EDUCATION'; payload: EducationEntry[] }
  | { type: 'SET_CERTIFICATIONS'; payload: CertificationEntry[] }
  | { type: 'SET_PROJECTS'; payload: ProjectEntry[] }
  | { type: 'SET_SKILLS'; payload: SkillCategory[] }
  | { type: 'SET_SETTINGS'; payload: Partial<ResumeSettings> }
  | { type: 'SET_JOB_DESCRIPTION'; payload: string }
  | { type: 'LOAD_DATA'; payload: ResumeData }
  | { type: 'RESET' };

// ---- Reducer ----

function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case 'SET_PERSONAL':
      return { ...state, personal: { ...state.personal, ...action.payload } };
    case 'SET_LINKS':
      return { ...state, links: { ...state.links, ...action.payload } };
    case 'SET_EDUCATION':
      return { ...state, education: action.payload };
    case 'SET_CERTIFICATIONS':
      return { ...state, certifications: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_SKILLS':
      return { ...state, skills: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_JOB_DESCRIPTION':
      return { ...state, targetJobDescription: action.payload };
    case 'LOAD_DATA':
      return {
        personal: { ...defaultResumeData.personal, ...(action.payload.personal || {}) },
        links: { ...defaultResumeData.links, ...(action.payload.links || {}) },
        education: Array.isArray(action.payload.education) ? action.payload.education : defaultResumeData.education,
        certifications: Array.isArray(action.payload.certifications) ? action.payload.certifications : defaultResumeData.certifications,
        projects: Array.isArray(action.payload.projects) ? action.payload.projects : defaultResumeData.projects,
        skills: Array.isArray(action.payload.skills) && action.payload.skills.length > 0
          ? action.payload.skills
          : defaultResumeData.skills,
        settings: { ...defaultResumeData.settings, ...(action.payload.settings || {}) },
        targetJobDescription: action.payload.targetJobDescription || '',
      };
    case 'RESET':
      return JSON.parse(JSON.stringify(defaultResumeData));
    default:
      return state;
  }
}

// ---- Context ----

interface ResumeContextType {
  state: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
  currentStep: WizardStep;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  /** Computed set — a step is in this set only when its data passes validation */
  completedSteps: Set<number>;
  /**
   * @deprecated No longer needed — completion is computed from data.
   * Kept as a no-op for backward compatibility with existing call sites.
   */
  markStepCompleted: (step: WizardStep) => void;
  githubRepos: GitHubRepo[];
  setGithubRepos: (repos: GitHubRepo[]) => void;
  isGithubLoading: boolean;
  setIsGithubLoading: (loading: boolean) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}

// ---- Provider ----

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, defaultResumeData);
  const [currentStep, setCurrentStep] = React.useState<WizardStep>(1);
  const [githubRepos, setGithubRepos] = React.useState<GitHubRepo[]>([]);
  const [isGithubLoading, setIsGithubLoading] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const { user } = useAuth();
  const params = useParams();
  const resumeId = (params?.id as string) || 'default';
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute completedSteps from actual data — no manual tracking needed
  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    for (let step = 1; step <= 7; step++) {
      if (isStepComplete(step, state)) {
        set.add(step);
      }
    }
    return set;
  }, [state]);

  // No-op — kept for backward compatibility with WizardContainer.handleNext()
  const markStepCompleted = useCallback((step: WizardStep) => {
    // Completion is now computed from data, so this is intentionally a no-op.
    void step;
  }, []);

  // Hydrate from Firestore (if user) or localStorage on mount/auth change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // If we aren't in the builder, don't auto-load and overwrite state unless it's the guest user.
      // But we still need to load the guest data.
      try {
        if (user) {
          // Fetch from Firestore
          const docRef = doc(db, 'users', user.id, 'resumes', resumeId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.resumeData && isMounted) {
              dispatch({ type: 'LOAD_DATA', payload: { ...defaultResumeData, ...data.resumeData } });
            }
            if (data.currentStep && isMounted) {
              setCurrentStep(data.currentStep);
            }
          } else if (resumeId === 'default') {
            // Check legacy migration path for the default resume
            const legacyRef = doc(db, 'resumes', user.id);
            const legacySnap = await getDoc(legacyRef);
            if (legacySnap.exists() && isMounted) {
               const data = legacySnap.data();
               if (data.resumeData) {
                 dispatch({ type: 'LOAD_DATA', payload: { ...defaultResumeData, ...data.resumeData } });
               }
               if (data.currentStep) setCurrentStep(data.currentStep);
               
               // Save to new path immediately
               await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
               
               // Delete legacy document to clean up tech debt
               try {
                 const { deleteDoc } = await import('firebase/firestore');
                 await deleteDoc(legacyRef);
               } catch (e) {
                 console.warn('Failed to delete legacy resume doc:', e);
               }
            } else {
               // See if they have local storage data as a guest
               const saved = localStorage.getItem(STORAGE_KEY);
               if (saved) {
                 const parsed = JSON.parse(saved);
                 if (parsed.resumeData && isMounted) {
                   dispatch({ type: 'LOAD_DATA', payload: { ...defaultResumeData, ...parsed.resumeData } });
                   if (parsed.currentStep) setCurrentStep(parsed.currentStep);
                   
                   await setDoc(docRef, {
                     resumeData: parsed.resumeData,
                     currentStep: parsed.currentStep || 1,
                     updatedAt: new Date().toISOString(),
                   });
                   localStorage.removeItem(STORAGE_KEY);
                 }
               } else if (isMounted) {
                  // Completely fresh default resume
                  dispatch({ type: 'RESET' });
               }
            }
          } else if (isMounted) {
             // New resume that doesn't exist yet
             dispatch({ type: 'RESET' });
          }
        } else {
          // 3. Guest: Load from Local Storage
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.resumeData && isMounted) {
              dispatch({ type: 'LOAD_DATA', payload: { ...defaultResumeData, ...parsed.resumeData } });
            }
            if (parsed.currentStep && isMounted) {
              setCurrentStep(parsed.currentStep);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load saved data:', e);
      } finally {
        if (isMounted) setHydrated(true);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, resumeId]);

  // Save to Firestore (if user) or localStorage (debounced)
  useEffect(() => {
    if (!hydrated) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (user) {
          // Save to Firestore
          const docRef = doc(db, 'users', user.id, 'resumes', resumeId);
          await setDoc(docRef, {
            resumeData: state,
            currentStep,
            updatedAt: new Date().toISOString(),
            // Keep track of some metadata for the dashboard
            resumeTitle: state.personal.headline || state.personal.fullName || 'Untitled Resume'
          }, { merge: true });
        } else {
          // Save to Local Storage for guests
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              resumeData: state,
              currentStep,
            })
          );
        }
      } catch (e) {
        console.warn('Failed to save data:', e);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Flush pending save immediately on unmount
        try {
          if (user) {
            const docRef = doc(db, 'users', user.id, 'resumes', resumeId);
            setDoc(docRef, {
              resumeData: state,
              currentStep,
              updatedAt: new Date().toISOString(),
              resumeTitle: state.personal.headline || state.personal.fullName || 'Untitled Resume'
            }, { merge: true }).catch(e => console.warn('Unmount save failed:', e));
          } else {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ resumeData: state, currentStep })
            );
          }
        } catch (e) {
          console.warn('Failed to flush save on unmount:', e);
        }
      }
    };
  }, [state, currentStep, hydrated, user, resumeId]);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = (prev + 1) as WizardStep;
      return next <= 7 ? next : prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = (prev - 1) as WizardStep;
      return next >= 1 ? next : prev;
    });
  }, []);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    completedSteps,
    markStepCompleted,
    githubRepos,
    setGithubRepos,
    isGithubLoading,
    setIsGithubLoading,
  }), [
    state,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    completedSteps,
    markStepCompleted,
    githubRepos,
    isGithubLoading
  ]);

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
}
