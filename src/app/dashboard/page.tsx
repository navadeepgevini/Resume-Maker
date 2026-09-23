'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserResume {
  id: string;
  resumeTitle?: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [resumes, setResumes] = useState<UserResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace('/login');
      return;
    }

    async function fetchResumes() {
      setLoading(true);
      try {
        const resumesRef = collection(db, 'users', user!.id, 'resumes');
        const qResumes = query(resumesRef, orderBy('updatedAt', 'desc'));
        const resumesSnap = await getDocs(qResumes);
        
        const fetchedResumes = resumesSnap.docs.map(d => ({
          id: d.id,
          resumeTitle: d.data().resumeTitle || 'Untitled Resume',
          updatedAt: d.data().updatedAt,
        })) as UserResume[];
        
        setResumes(fetchedResumes);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResumes();
  }, [user, authLoading, router]);

  const handleCreateNew = () => {
    // Generate a new random ID (a simple timestamp + random string, or crypto)
    const newId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    router.push(`/builder/${newId}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this resume? This cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'resumes', id));
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete resume', err);
      alert('Failed to delete resume. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-ink">My Resumes</h1>
          <button 
            onClick={handleCreateNew}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent/90"
          >
            + Create New Resume
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-divider bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-ink mb-2">No resumes found</h2>
            <p className="text-warm-gray mb-6">You haven&apos;t created any resumes yet. Start building your first one!</p>
            <button 
              onClick={handleCreateNew}
              className="rounded-lg bg-accent px-6 py-3 font-semibold text-white shadow hover:bg-accent/90"
            >
              Start Building
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map(resume => (
              <Link key={resume.id} href={`/builder/${resume.id}`}>
                <div className="group relative rounded-xl border border-divider bg-white p-6 shadow-sm transition hover:shadow-md hover:border-accent cursor-pointer flex flex-col h-full">
                  <div className="mb-4 flex-1">
                    <h3 className="font-semibold text-ink text-lg truncate group-hover:text-accent transition-colors">
                      {resume.resumeTitle}
                    </h3>
                    <div className="text-sm text-warm-gray mt-1">
                      ID: <span className="font-mono text-xs">{resume.id === 'default' ? 'Legacy (Default)' : resume.id.split('_')[1] || resume.id}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-divider pt-4">
                    <span className="text-xs text-warm-gray">
                      Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDelete(resume.id, e)}
                      className="text-warm-gray hover:text-error transition-colors p-1"
                      title="Delete Resume"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
