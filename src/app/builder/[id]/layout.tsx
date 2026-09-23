import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Build Your Resume — RESUMEMAKER',
  description: 'Create a polished, ATS-friendly resume with our guided step-by-step builder.',
};

export default function BuilderRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
