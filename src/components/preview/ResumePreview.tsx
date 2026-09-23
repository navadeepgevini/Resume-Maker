'use client';

import { useRef, useEffect, useState } from 'react';
import type { ResumeData } from '@/types/resume';
import { PAGE_DIMENSIONS, PREVIEW_DEBOUNCE_MS } from '@/lib/constants';
import ResumeDocument from './ResumeDocument';

interface ResumePreviewProps {
  data: ResumeData;
  onOverflowChange?: (overflows: boolean) => void;
}

export default function ResumePreview({ data, onOverflowChange }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const dims = PAGE_DIMENSIONS[data.settings.pageSize];

  // Compute scale to fit container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const newScale = Math.min(containerWidth / dims.width, 1);
        setScale(newScale);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [dims.width]);

  // Check overflow (debounced)
  useEffect(() => {
    if (!onOverflowChange || !documentRef.current) return;

    const timer = setTimeout(() => {
      const el = documentRef.current;
      if (!el) return;
      const overflows = el.scrollHeight > dims.height + 2; // 2px tolerance
      onOverflowChange(overflows);
    }, PREVIEW_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [data, dims.height, onOverflowChange]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-[#f0f0ec] p-4 flex justify-center">
      <div
        style={{
          width: dims.width,
          height: dims.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: dims.height * (scale - 1),
        }}
      >
        <div
          ref={documentRef}
          className="bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
          style={{
            width: dims.width,
            height: dims.height,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ResumeDocument data={data} />
        </div>
      </div>
    </div>
  );
}
