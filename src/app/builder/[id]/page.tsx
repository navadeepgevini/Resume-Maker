'use client';

import BuilderLayout from '@/components/builder/BuilderLayout';
import { WizardContainer } from '@/components/wizard';

export default function BuilderPage() {
  return (
    <BuilderLayout>
      <WizardContainer />
    </BuilderLayout>
  );
}
