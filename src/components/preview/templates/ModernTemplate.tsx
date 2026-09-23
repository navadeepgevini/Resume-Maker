'use client';

import type { ResumeData } from '@/types/resume';
import { PAGE_DIMENSIONS } from '@/lib/constants';

interface TemplateProps {
  data: ResumeData;
}

export default function ModernTemplate({ data }: TemplateProps) {
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

  const linkItems: string[] = [];
  if (data.links.linkedin) linkItems.push(data.links.linkedin);
  if (data.links.github) linkItems.push(`github.com/${data.links.github}`);
  if (data.links.leetcode) linkItems.push(data.links.leetcode);
  if (data.links.codeforces) linkItems.push(data.links.codeforces);
  if (data.links.hackerrank) linkItems.push(data.links.hackerrank);
  if (data.links.personalSite) linkItems.push(data.links.personalSite);

  return (
    <div
      style={{
        width: dims.width,
        minHeight: dims.height,
        backgroundColor: '#FFFFFF',
        color: '#1C1C1A',
        fontFamily: '"Calibri", "Arial", sans-serif',
        fontSize: '10pt',
        lineHeight: 1.4,
        boxSizing: 'border-box',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
      }}
    >
      {/* LEFT SIDEBAR - 35% */}
      <div
        style={{
          width: '35%',
          backgroundColor: '#33415C',
          color: '#FFFFFF',
          padding: `${margin}px 24px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {hasPhoto && (
            <img
              src={data.personal.photo}
              alt="Profile"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }}
            />
          )}
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {data.personal.fullName || 'Your Name'}
          </h1>
          {data.personal.headline && (
            <div style={{ fontSize: '11pt', opacity: 0.9 }}>
              {data.personal.headline}
            </div>
          )}
        </div>

        {contactItems.length > 0 && (
          <div>
            <h3 style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', marginBottom: '8px', marginTop: 0 }}>
              Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9.5pt', opacity: 0.9 }}>
              {contactItems.map((item, idx) => (
                <span key={idx}>{item}</span>
              ))}
            </div>
          </div>
        )}

        {linkItems.length > 0 && (
          <div>
            <h3 style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', marginBottom: '8px', marginTop: 0 }}>
              Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9.5pt', opacity: 0.9 }}>
              {linkItems.map((item, idx) => (
                <span key={idx}>{item}</span>
              ))}
            </div>
          </div>
        )}

        {nonEmptySkills.length > 0 && (
          <div>
            <h3 style={{ fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px', marginBottom: '8px', marginTop: 0 }}>
              Skills
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '9.5pt', opacity: 0.9 }}>
              {nonEmptySkills.map((cat) => (
                <div key={cat.id}>
                  <strong style={{ display: 'block', marginBottom: '2px', color: '#FFFFFF' }}>{cat.name}</strong>
                  <div>{cat.skills.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - 65% */}
      <div
        style={{
          width: '65%',
          padding: `${margin}px 32px ${margin}px 24px`,
          boxSizing: 'border-box',
        }}
      >
        {data.education.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#33415C', borderBottom: '2px solid #33415C', paddingBottom: '4px', marginBottom: '12px', marginTop: 0 }}>
              EDUCATION
            </h2>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '11pt', color: '#1C1C1A' }}>{edu.institution}</span>
                  <span style={{ color: '#6B6B63', fontSize: '9.5pt' }}>
                    {edu.startYear} - {edu.endYear}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>{edu.degree}</span>
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
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#33415C', borderBottom: '2px solid #33415C', paddingBottom: '4px', marginBottom: '12px', marginTop: 0 }}>
              CERTIFICATIONS
            </h2>
            {data.certifications.map((cert) => (
              <div key={cert.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#1C1C1A' }}>{cert.title}</strong>
                  <div style={{ color: '#6B6B63', fontSize: '9.5pt' }}>{cert.issuer}</div>
                </div>
                <span style={{ color: '#6B6B63', fontSize: '9.5pt' }}>{cert.completionDate}</span>
              </div>
            ))}
          </div>
        )}

        {featured.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#33415C', borderBottom: '2px solid #33415C', paddingBottom: '4px', marginBottom: '12px', marginTop: 0 }}>
              PROJECTS
            </h2>
            {featured.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '11pt', color: '#1C1C1A' }}>
                    {proj.name}
                  </span>
                  <span style={{ fontSize: '9pt' }}>
                    {proj.liveLink && (
                      <a href={proj.liveLink} style={{ color: '#33415C', textDecoration: 'none', marginRight: '8px' }}>
                        Live
                      </a>
                    )}
                    {proj.repoLink && (
                      <a href={proj.repoLink} style={{ color: '#33415C', textDecoration: 'none' }}>
                        GitHub
                      </a>
                    )}
                  </span>
                </div>
                {proj.techStack.length > 0 && (
                  <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#6B6B63', marginBottom: '4px' }}>
                    {proj.techStack.join(', ')}
                  </div>
                )}
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {proj.bullets.filter(b => b.trim() !== '').map((bullet, idx) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>
                    {bullet}
                  </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
