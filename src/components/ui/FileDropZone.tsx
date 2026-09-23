'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResume, defaultResumeData } from '@/context/ResumeContext';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';

interface FileDropZoneProps {
  compact?: boolean;
}

export default function FileDropZone({ compact = false }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { dispatch } = useResume();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    
    const validTypes = ['.pdf', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(ext) && file.type !== 'application/pdf' && !file.type.includes('word') && !file.type.includes('text') && !file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('Invalid file type. Please upload a PDF, DOCX, TXT, or image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    setStatus('uploading');
    setProgressText(file.type.startsWith('image/') ? 'Reading image...' : 'Extracting text...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      setTimeout(() => setProgressText('Analyzing with AI...'), 1000);
      
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse file');
      }

      const result = await response.json();
      
      if (result.parsedData) {
        setProgressText('Done!');
        setStatus('success');
        
        // Merge parsed data with defaults to ensure all required fields exist
        const resumeData = result.parsedData;
        setTimeout(() => {
          dispatch({
            type: 'LOAD_DATA',
            payload: {
              personal: { ...defaultResumeData.personal, ...(resumeData.personal || {}) },
              links: { ...defaultResumeData.links, ...(resumeData.links || {}) },
              education: Array.isArray(resumeData.education) ? resumeData.education : [],
              certifications: Array.isArray(resumeData.certifications) ? resumeData.certifications : [],
              projects: Array.isArray(resumeData.projects) ? resumeData.projects : [],
              skills: Array.isArray(resumeData.skills) && resumeData.skills.length > 0
                ? resumeData.skills
                : defaultResumeData.skills,
              settings: { ...defaultResumeData.settings, ...(resumeData.settings || {}) },
            },
          });
          if (window.location.pathname !== '/builder/default' && !window.location.pathname.startsWith('/builder/')) {
            router.push('/builder/default');
          }
        }, 500);
      } else {
        // AI parsing unavailable — text was extracted but not structured
        setStatus('error');
        setErrorMsg(
          result.message || 'AI parsing is not available. Please set GEMINI_API_KEY in .env.local to enable Smart Import.'
        );
      }
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during upload');
    }
  }, [dispatch, router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#33415C] w-12 h-12 mb-4">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
      <path d="M12 12v9"></path>
      <path d="m16 16-4-4-4 4"></path>
    </svg>
  );
  
  const Spinner = () => (
    <svg className="animate-spin h-8 w-8 text-[#33415C] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-4">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const renderDropZone = () => (
    <div
      className={`border-dashed border-2 rounded-[8px] p-8 flex flex-col items-center justify-center transition-colors text-center ${
        isDragging ? 'border-[#33415C] bg-[#33415C]/5' : 'border-[#E4E4DF] hover:border-[#33415C]/40'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,image/*"
      />
      
      {status === 'idle' && (
        <>
          <UploadIcon />
          <h3 className="text-lg font-semibold text-[#1C1C1A]">Drop your resume here</h3>
          <p className="text-sm text-[#6B6B63] mt-2 mb-4">Accepted: PDF, DOCX, TXT, JPG, PNG (Max 5MB)</p>
          <div className="flex items-center gap-2 mb-4 w-full max-w-[200px]">
            <div className="h-[1px] bg-[#E4E4DF] flex-1"></div>
            <span className="text-xs text-[#6B6B63]">or</span>
            <div className="h-[1px] bg-[#E4E4DF] flex-1"></div>
          </div>
          <Button onClick={triggerFileSelect} variant="secondary">Browse Files</Button>
        </>
      )}

      {status === 'uploading' && (
        <>
          <Spinner />
          <h3 className="text-lg font-semibold text-[#1C1C1A]">{progressText}</h3>
        </>
      )}

      {status === 'success' && (
        <>
          <SuccessIcon />
          <h3 className="text-lg font-semibold text-[#1C1C1A]">{progressText}</h3>
        </>
      )}

      {status === 'error' && (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-4">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 className="text-lg font-semibold text-[#B91C1C] mb-2">Upload Failed</h3>
          <p className="text-sm text-[#6B6B63] mb-4">{errorMsg}</p>
          <Button onClick={() => setStatus('idle')} variant="secondary">Try Again</Button>
        </>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="w-full flex flex-col">
        <Button 
          variant="secondary" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-start text-[#1C1C1A]"
        >
          📄 Import from file
        </Button>
        {isExpanded && (
          <div className="mt-4">
            {renderDropZone()}
          </div>
        )}
      </div>
    );
  }

  return renderDropZone();
}
