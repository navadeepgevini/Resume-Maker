'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date | null;
}

interface UserResume {
  id: string;
  resumeData?: {
    personal?: {
      fullName?: string;
      email?: string;
    };
    [key: string]: unknown;
  };
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [resumes, setResumes] = useState<UserResume[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'users'>('activity');
  const [selectedResume, setSelectedResume] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch recent activity
      const logsRef = collection(db, 'activityLogs');
      const qLogs = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
      const logsSnap = await getDocs(qLogs);
      const fetchedLogs = logsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate() || null,
        } as ActivityLog;
      });
      setLogs(fetchedLogs);

      // Fetch users (resumes)
      const resumesRef = collection(db, 'resumes');
      const qResumes = query(resumesRef, orderBy('updatedAt', 'desc'), limit(50));
      const resumesSnap = await getDocs(qResumes);
      const fetchedResumes = resumesSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as UserResume[];
      setResumes(fetchedResumes);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!isAdmin) {
      router.replace('/');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [user, authLoading, router, isAdmin, fetchData]);



  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>
          <button 
            onClick={fetchData}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent/90"
          >
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-divider">
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 font-medium transition-colors ${activeTab === 'activity' ? 'border-b-2 border-accent text-accent' : 'text-warm-gray hover:text-ink'}`}
          >
            Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 font-medium transition-colors ${activeTab === 'users' ? 'border-b-2 border-accent text-accent' : 'text-warm-gray hover:text-ink'}`}
          >
            User Resumes
          </button>
        </div>

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="overflow-hidden rounded-xl border border-divider bg-white shadow-sm">
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-background font-semibold border-b border-divider">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {logs.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-warm-gray">No activity found.</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-background/50">
                    <td className="whitespace-nowrap px-6 py-4 text-warm-gray">
                      {log.timestamp ? log.timestamp.toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {log.userEmail || <span className="text-warm-gray italic">Guest</span>}
                      <div className="text-xs text-warm-gray">{log.userId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <pre className="max-w-xs truncate">{JSON.stringify(log.details)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.length === 0 ? (
              <div className="col-span-full p-6 text-center text-warm-gray border border-divider rounded-xl">No user data found.</div>
            ) : resumes.map(resume => (
              <div key={resume.id} className="rounded-xl border border-divider bg-white p-6 shadow-sm transition hover:shadow-md">
                <h3 className="font-semibold text-ink truncate">{resume.resumeData?.personal?.fullName || 'Unnamed User'}</h3>
                <p className="text-sm text-warm-gray truncate mb-4">{resume.resumeData?.personal?.email || resume.id}</p>
                <div className="text-xs text-warm-gray mb-4">
                  Last updated: {new Date(resume.updatedAt).toLocaleString()}
                </div>
                <button
                  onClick={() => setSelectedResume(resume.resumeData || null)}
                  className="w-full rounded-lg bg-background px-4 py-2 text-sm font-medium text-ink hover:bg-divider transition"
                >
                  View JSON Data
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSON Viewer Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-divider p-4">
              <h3 className="text-lg font-bold text-ink">Resume Data Snapshot</h3>
              <button 
                onClick={() => setSelectedResume(null)}
                className="rounded-full p-2 hover:bg-background text-warm-gray"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-4 bg-background">
              <pre className="text-xs text-ink whitespace-pre-wrap">
                {JSON.stringify(selectedResume, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
