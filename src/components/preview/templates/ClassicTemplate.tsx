'use client';

import type { ResumeData } from '@/types/resume';
import { PAGE_DIMENSIONS } from '@/lib/constants';

interface TemplateProps {
  data: ResumeData;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '11pt',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2.5px',
        borderBottom: '1px solid #1C1C1A',
        marginBottom: '8px',
        marginTop: '16px',
        paddingBottom: '2px',
      }}
    >
      {children}
    </h2>
  );
}

export default function ClassicTemplate({ data }: TemplateProps) {
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
        backgroundColor: '#FFFFFF',
        color: '#1C1C1A',
        fontFamily: '"Calibri", "Arial", sans-serif',
        fontSize: '10pt',
        lineHeight: 1.4,
        padding: margin,
        boxSizing: 'border-box',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '22pt', fontWeight: 'bold', margin: 0 }}>
            {data.personal.fullName || 'Your Name'}
          </h1>
          {data.personal.headline && (
            <div style={{ fontSize: '12pt', marginTop: '4px' }}>
              {data.personal.headline}
            </div>
          )}
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {contactItems.map((item, idx) => (
              <span key={idx}>
                {item}
                {idx < contactItems.length - 1 && <span style={{ margin: '0 4px' }}>|</span>}
              </span>
            ))}
          </div>
        </div>
        {hasPhoto && (
          <img
            src={data.personal.photo}
            alt="Profile"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginLeft: '16px' }}
          />
        )}
      </div>

      {data.education.length > 0 && (
        <div>
          <SectionHeading>Education</SectionHeading>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.institution}</span>
                <span>
                  {edu.startYear} - {edu.endYear}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{edu.degree}</span>
                <span>
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
            <div key={cert.id} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <strong>{cert.title}</strong> - {cert.issuer}
              </span>
              <span>{cert.completionDate}</span>
            </div>
          ))}
        </div>
      )}

      {featured.length > 0 && (
        <div>
          <SectionHeading>Projects</SectionHeading>
          {featured.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                <span>
                  {proj.name}
                  {proj.techStack.length > 0 && (
                    <span style={{ fontWeight: 'normal', fontStyle: 'italic', marginLeft: '8px' }}>
                      ({proj.techStack.join(', ')})
                    </span>
                  )}
                </span>
                <span>
                  {proj.liveLink && (
                    <a href={proj.liveLink} style={{ color: '#1C1C1A', textDecoration: 'none', marginRight: '8px' }}>
                      Live
                    </a>
                  )}
                  {proj.repoLink && (
                    <a href={proj.repoLink} style={{ color: '#1C1C1A', textDecoration: 'none' }}>
                      GitHub
                    </a>
                  )}
                </span>
              </div>
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

      {nonEmptySkills.length > 0 && (
        <div>
          <SectionHeading>Skills</SectionHeading>
          {nonEmptySkills.map((cat) => (
            <div key={cat.id} style={{ marginBottom: '4px' }}>
              <strong>{cat.name}:</strong> {cat.skills.join(', ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
