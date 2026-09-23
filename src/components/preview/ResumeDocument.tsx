'use client';

import type { ResumeData } from '@/types/resume';
import { ClassicTemplate, ModernTemplate, BoldTemplate } from './templates';

interface ResumeDocumentProps {
  data: ResumeData;
}

/**
 * Thin wrapper that renders the selected resume template.
 * Template selection is stored in data.settings.template.
 */
export default function ResumeDocument({ data }: ResumeDocumentProps) {
  const template = data.settings?.template || 'classic';

  switch (template) {
    case 'modern':
      return <ModernTemplate data={data} />;
    case 'bold':
      return <BoldTemplate data={data} />;
    case 'classic':
    default:
      return <ClassicTemplate data={data} />;
  }
}
