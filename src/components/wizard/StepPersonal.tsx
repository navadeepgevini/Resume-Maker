'use client';

import { useState, useCallback, useRef } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import PhotoCropper from '@/components/cropper/PhotoCropper';
import { validateEmail, validatePhone } from '@/lib/validators';
import type { PersonalDetails } from '@/types/resume';

interface FieldErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  cityState?: string;
}

export default function StepPersonal() {
  const { state, dispatch } = useResume();
  const personal = state.personal;

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (field: keyof PersonalDetails, value: string | boolean) => {
      dispatch({ type: 'SET_PERSONAL', payload: { [field]: value } });
    },
    [dispatch],
  );

  const validateField = useCallback(
    (field: keyof FieldErrors, value: string) => {
      let error = '';

      switch (field) {
        case 'fullName':
          if (!value.trim()) error = 'Full name is required';
          break;
        case 'email': {
          const result = validateEmail(value);
          if (!result.valid) error = result.message || 'Invalid email';
          break;
        }
        case 'phone': {
          const result = validatePhone(value);
          if (!result.valid) error = result.message || 'Invalid phone';
          break;
        }
        case 'cityState':
          if (!value.trim()) error = 'City/State is required';
          break;
      }

      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    },
    [],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        setRawPhotoSrc(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [],
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawPhotoSrc(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleCropSave = useCallback(
    (croppedBase64: string) => {
      dispatch({ 
        type: 'SET_PERSONAL', 
        payload: { photo: croppedBase64, showPhoto: true } 
      });
      // Also enable the global settings flag — templates check both
      dispatch({
        type: 'SET_SETTINGS',
        payload: { showPhoto: true }
      });
      setIsCropperOpen(false);
      setRawPhotoSrc('');
    },
    [dispatch],
  );

  const handleRemovePhoto = useCallback(() => {
    update('photo', '');
  }, [update]);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold text-[#1C1C1A]"
          style={{ fontFamily: 'var(--font-plex-sans)' }}
        >
          Personal Details
        </h2>
        <p className="mt-1 text-sm text-[#6B6B63]">
          Basic information that appears at the top of your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            id="personal-fullName"
            label="Full Name"
            required
            value={personal.fullName ?? ''}
            onChange={(e) => update('fullName', e.target.value)}
            onBlur={(e) => validateField('fullName', e.target.value)}
            error={errors.fullName}
            placeholder="John Doe"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            id="personal-headline"
            label="Professional Headline"
            value={personal.headline ?? ''}
            onChange={(e) => update('headline', e.target.value)}
            placeholder="Full-Stack Developer · Open Source Contributor"
            helperText="Optional — appears below your name"
          />
        </div>

        <Input
          id="personal-phone"
          label="Phone"
          required
          type="tel"
          value={personal.phone ?? ''}
          onChange={(e) => update('phone', e.target.value)}
          onBlur={(e) => validateField('phone', e.target.value)}
          error={errors.phone}
          placeholder="+1 (555) 123-4567"
        />

        <Input
          id="personal-email"
          label="Email"
          required
          type="email"
          value={personal.email ?? ''}
          onChange={(e) => update('email', e.target.value)}
          onBlur={(e) => validateField('email', e.target.value)}
          error={errors.email}
          placeholder="john@example.com"
        />

        <Input
          id="personal-cityState"
          label="City / State"
          required
          value={personal.cityState ?? ''}
          onChange={(e) => update('cityState', e.target.value)}
          onBlur={(e) => validateField('cityState', e.target.value)}
          error={errors.cityState}
          placeholder="San Francisco, CA"
        />

        <div className="space-y-2">
          <Input
            id="personal-dob"
            label="Date of Birth"
            type="date"
            value={personal.dateOfBirth ?? ''}
            onChange={(e) => update('dateOfBirth', e.target.value)}
          />
          <Toggle
            id="personal-showDOB"
            label="Show on resume"
            checked={personal.showDOB ?? false}
            onChange={(checked) => update('showDOB', checked)}
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#1C1C1A]">Photo</label>

        <div className="flex items-start gap-4">
          {personal.photo ? (
            <div className="flex items-center gap-3">
              <img
                src={personal.photo}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-[#E4E4DF]"
              />
              <Button variant="ghost" onClick={handleRemovePhoto}>
                Remove
              </Button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-[#E4E4DF] rounded-[6px] cursor-pointer hover:border-[#33415C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#33415C] focus:ring-offset-2"
            >
              <svg className="w-6 h-6 text-[#6B6B63] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm text-[#6B6B63]">Click or drag to upload</span>
              <span className="text-xs text-[#6B6B63] mt-1">JPG, PNG up to 5 MB</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload photo"
          />
        </div>

        <Toggle
          id="personal-showPhoto"
          label="Include photo in resume"
          checked={personal.showPhoto ?? true}
          onChange={(checked) => update('showPhoto', checked)}
        />
      </div>

      {/* Photo Cropper Modal */}
      <Modal
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setRawPhotoSrc('');
        }}
        title="Crop Photo"
      >
        {rawPhotoSrc && (
          <PhotoCropper
            imageSrc={rawPhotoSrc}
            onSave={handleCropSave}
            onCancel={() => {
              setIsCropperOpen(false);
              setRawPhotoSrc('');
            }}
          />
        )}
      </Modal>
    </div>
  );
}
