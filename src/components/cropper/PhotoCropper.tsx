'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg, blobToBase64 } from '@/lib/cropImage';
import { Button } from '@/components/ui/Button';

interface PhotoCropperProps {
  imageSrc: string;
  onSave: (croppedBase64: string) => void;
  onCancel: () => void;
}

export default function PhotoCropper({ imageSrc, onSave, onCancel }: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, 400, 0.85);
      const base64 = await blobToBase64(blob);
      onSave(base64);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setSaving(false);
    }
  }, [imageSrc, croppedAreaPixels, onSave]);

  return (
    <div className="space-y-4">
      <div
        className="relative w-full bg-black/5 rounded-[4px] overflow-hidden"
        style={{ height: 320 }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="rect"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3">
        <label htmlFor="photo-zoom" className="text-sm font-medium text-[#1C1C1A]">
          Zoom
        </label>
        <input
          id="photo-zoom"
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[#33415C] h-1.5"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
          Save Photo
        </Button>
      </div>
    </div>
  );
}
