'use client';

import dynamic from 'next/dynamic';

// Disable SSR for the builder to prevent hydration mismatches caused by browser extensions 
// (like LastPass/Grammarly) injecting elements into form fields before React hydrates.
const BuilderLayout = dynamic(() => import('@/components/builder/BuilderLayout'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-[#FAFAF9]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#33415C] border-t-transparent" />
    </div>
  )
});
const WizardContainer = dynamic(() => import('@/components/wizard').then(mod => mod.WizardContainer), { 
  ssr: false,
  loading: () => (
    <div className="flex w-full h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#33415C] border-t-transparent" />
    </div>
  )
});

export default function BuilderPage() {
  return (
    <BuilderLayout>
      <WizardContainer />
    </BuilderLayout>
  );
}
