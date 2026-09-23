'use client';

import type { ResumeData } from '@/types/resume';
import { PAGE_DIMENSIONS } from '@/lib/constants';

interface TemplateProps {
  data: ResumeData;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px', marginTop: '20px' }}>
      <span
        style={{
          display: 'inline-block',
          backgroundColor: '#33415C',
          color: '#FFFFFF',
          fontSize: '11pt',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          padding: '3px 10px',
          borderRadius: '2px',
          letterSpacing: '1px',
        }}
      >
        {children}
      </span>
    </div>
  );
}

export default function BoldTemplate({ data }: TemplateProps) {
  const dims = PAGE_DIMENSIONS[data.settings.pageSize];
  const margin = 48;
  const hasPhoto = Boolean(
    data.settings.showPhoto &&
      data.personal.showPhoto &&
      data.personal.photo &&
      data.personal.photo.length > 100
  );
  const featured = data.projects.filter((p) => p.featured);
  const nonEmptySkills = data.skills.filter((c) => c.skills.length > 0);

  const contactItems: string[] = [];
  if (data.personal.email) contactItems.push(data.personal.email);
  if (data.personal.phone) contactItems.push(data.personal.phone);
  if (data.personal.cityState) contactItems.push(data.personal.cityState);
  if (data.links.linkedin) contactItems.push(data.links.linkedin);
  if (data.links.github) contactItems.push(`github.com/${data.links.github}`);
  if (data.links.leetcode) contactItems.push(data.links.leetcode);
  if (data.links.codeforces) contactItems.push(data.links.codeforces);
  if (data.links.hackerrank) contactItems.push(data.links.hackerrank);
  if (data.links.personalSite) contactItems.push(data.links.personalSite);

  return (
    <div
      style={{
        width: dims.width,
        minHeight: dims.height,
        backgroundColor: '#FAFAF9',
        color: '#1C1C1A',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: '10pt',
        lineHeight: 1.4,
        padding: margin,
        boxSizing: 'border-box',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {hasPhoto && (
          <div style={{ marginBottom: '16px' }}>
            <img
              src={data.personal.photo}
              alt="Profile"
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
        )}
        <h1 style={{ fontSize: '26pt', fontWeight: 'bold', margin: 0, color: '#1C1C1A' }}>
          {data.personal.fullName || 'Your Name'}
        </h1>
        
        {/* Accent Bar */}
        <div
          style={{
            height: '3px',
            backgroundColor: '#33415C',
            width: '100%',
            margin: '12px 0',
          }}
        />
        
        {data.personal.headline && (
          <div style={{ fontSize: '12pt', fontStyle: 'italic', marginBottom: '12px', color: '#6B6B63' }}>
            {data.personal.headline}
          </div>
        )}

        <div style={{ fontSize: '9pt', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {contactItems.map((item, idx) => (
            <span key={idx}>
              {item}
              {idx < contactItems.length - 1 && <span style={{ margin: '0 6px', color: '#6B6B63' }}>•</span>}
            </span>
          ))}
        </div>
      </div>

      {data.education.length > 0 && (
        <div>
          <SectionHeading>Education</SectionHeading>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11pt' }}>
                <span>{edu.institution}</span>
                <span>
                  {edu.startYear} - {edu.endYear}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                <span style={{ fontStyle: 'italic' }}>{edu.degree}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {edu.gradeType === 'cgpa' ? 'CGPA: ' : ''}
                  {edu.gradeValue}
                  {edu.gradeType === 'percentage' ? '%' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.certifications.length > 0 && (
        <div>
          <SectionHeading>Certifications</SectionHeading>
          {data.certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <strong style={{ fontSize: '10.5pt' }}>{cert.title}</strong>{' '}
                <span style={{ color: '#6B6B63' }}>| {cert.issuer}</span>
              </span>
              <span style={{ fontWeight: 'bold' }}>{cert.completionDate}</span>
            </div>
          ))}
        </div>
      )}

      {featured.length > 0 && (
        <div>
          <SectionHeading>Projects</SectionHeading>
          {featured.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <span>
                  <strong style={{ fontSize: '11pt' }}>{proj.name}</strong>
                  {proj.techStack.length > 0 && (
                    <span style={{ fontStyle: 'italic', color: '#6B6B63', marginLeft: '8px' }}>
                      | {proj.techStack.join(', ')}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '9pt' }}>
                  {proj.liveLink && (
                    <a href={proj.liveLink} style={{ color: '#33415C', fontWeight: 'bold', textDecoration: 'none', marginRight: '12px' }}>
                      LIVE
                    </a>
                  )}
                  {proj.repoLink && (
                    <a href={proj.repoLink} style={{ color: '#33415C', fontWeight: 'bold', textDecoration: 'none' }}>
                      GITHUB
                    </a>
                  )}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '9.5pt' }}>
                {proj.bullets.filter(b => b.trim() !== '').map((bullet, idx) => (
                  <li key={idx} style={{ marginBottom: '3px' }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {nonEmptySkills.length > 0 && (
        <div>
          <SectionHeading>Skills</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {nonEmptySkills.map((cat) => (
              <div key={cat.id}>
                <strong style={{ display: 'block', marginBottom: '2px', color: '#33415C' }}>{cat.name}</strong>
                <div style={{ lineHeight: 1.2 }}>{cat.skills.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
