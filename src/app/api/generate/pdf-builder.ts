import type { ResumeData } from '@/types/resume';

/**
 * Escape HTML entities.
 */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build a self-contained HTML string that mirrors the resume template.
 * Exported so the API route can return it for client-side PDF printing.
 */
export function buildResumeHTML(data: ResumeData): string {
  const isLetter = data.settings.pageSize === 'letter';
  const pageWidth = isLetter ? '8.5in' : '210mm';
  const pageHeight = isLetter ? '11in' : '297mm';

  const hasPhoto =
    data.settings.showPhoto &&
    data.personal.showPhoto &&
    data.personal.photo &&
    data.personal.photo.length > 100;

  const contactItems: string[] = [];
  if (data.personal.email) contactItems.push(esc(data.personal.email));
  if (data.personal.phone) contactItems.push(esc(data.personal.phone));
  if (data.personal.cityState) contactItems.push(esc(data.personal.cityState));
  if (data.links.linkedin) contactItems.push(esc(data.links.linkedin));
  if (data.links.github) contactItems.push(`github.com/${esc(data.links.github)}`);
  if (data.links.leetcode) contactItems.push(esc(data.links.leetcode));
  if (data.links.hackerrank) contactItems.push(esc(data.links.hackerrank));
  if (data.links.personalSite) contactItems.push(esc(data.links.personalSite));

  const featured = data.projects.filter((p) => p.featured);
  const nonEmptySkills = data.skills.filter((c) => c.skills.length > 0);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: ${pageWidth} ${pageHeight}; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      color: #1C1C1A;
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    .header-table td { vertical-align: middle; padding: 0; border: none; }
    .name { font-size: 22pt; font-weight: 700; color: #1C1C1A; line-height: 1.15; }
    .headline { font-size: 11pt; color: #6B6B63; margin-top: 2px; }
    .headshot { width: 72px; height: 72px; object-fit: cover; display: block; }
    .contact-row {
      text-align: center; font-size: 9pt; color: #6B6B63;
      padding: 6px 0; border-bottom: 1px solid #E4E4DF; margin-bottom: 6px;
    }
    .contact-sep { color: #CCC; margin: 0 6px; }
    .section-heading {
      font-size: 10.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 2.5px; color: #1C1C1A;
      border-bottom: 1px solid #E4E4DF; padding-bottom: 3px;
      margin-top: 10px; margin-bottom: 5px;
    }
    .entry { margin-bottom: 4px; }
    .entry-title { font-weight: 700; }
    .entry-details { color: #6B6B63; }
    .project-tech { font-family: 'Courier New', Courier, monospace; font-size: 9pt; color: #6B6B63; }
    .bullet-list { margin: 2px 0 4px 18px; padding: 0; }
    .bullet-list li { margin-bottom: 1px; }
    .bullet-list p { display: inline; margin: 0; padding: 0; }
    .bullet-list a { color: #1C1C1A; text-decoration: underline; }
    .skill-cat { font-weight: 700; }
    .skill-items { font-family: 'Courier New', Courier, monospace; font-size: 9pt; }
  </style>
</head>
<body>
  ${hasPhoto ? `
  <table class="header-table">
    <tr>
      <td style="width: 82px; padding-right: 10px;">
        <img src="${data.personal.photo}" class="headshot" />
      </td>
      <td>
        <div class="name">${esc(data.personal.fullName)}</div>
        ${data.personal.headline ? `<div class="headline">${esc(data.personal.headline)}</div>` : ''}
      </td>
    </tr>
  </table>` : `
  <div class="name">${esc(data.personal.fullName)}</div>
  ${data.personal.headline ? `<div class="headline">${esc(data.personal.headline)}</div>` : ''}`}

  ${contactItems.length > 0 ? `
  <div class="contact-row">
    ${contactItems.join('<span class="contact-sep">|</span>')}
  </div>` : ''}

  ${data.education.length > 0 ? `
  <div class="section-heading">Education</div>
  ${data.education.map(edu => {
    const details: string[] = [];
    if (edu.degree) details.push(esc(edu.degree));
    if (edu.startYear && edu.endYear) details.push(`${esc(edu.startYear)}–${esc(edu.endYear)}`);
    if (edu.gradeValue) details.push(`${esc(edu.gradeValue)} ${edu.gradeType === 'cgpa' ? 'CGPA' : '%'}`);
    return `<div class="entry"><span class="entry-title">${esc(edu.institution)}</span>${details.length > 0 ? ` <span class="entry-details">— ${details.join('  |  ')}</span>` : ''}</div>`;
  }).join('\n')}` : ''}

  ${data.certifications.length > 0 ? `
  <div class="section-heading">Certifications</div>
  ${data.certifications.map(cert => {
    const details: string[] = [];
    if (cert.issuer) details.push(esc(cert.issuer));
    if (cert.completionDate) details.push(esc(cert.completionDate));
    return `<div class="entry"><span class="entry-title">${esc(cert.title)}</span>${details.length > 0 ? ` <span class="entry-details">— ${details.join('  |  ')}</span>` : ''}</div>`;
  }).join('\n')}` : ''}

  ${data.experience && data.experience.length > 0 ? `
  <div class="section-heading">Experience</div>
  ${data.experience.map(exp => `
    <div class="entry">
      <span class="entry-title">${esc(exp.company)}</span>
      <span style="font-weight: normal; margin-left: 8px;">${esc(exp.role)}</span>
      ${exp.startDate && exp.endDate ? `<span class="entry-details" style="float: right;">${esc(exp.startDate)} – ${esc(exp.endDate)}</span>` : ''}
    </div>
    ${exp.bullets.filter(b => b.trim() && b.trim() !== '<p></p>').length > 0 ? `<ul class="bullet-list">${exp.bullets.filter(b => b.trim() && b.trim() !== '<p></p>').map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
  `).join('\n')}` : ''}

  ${featured.length > 0 ? `
  <div class="section-heading">Projects</div>
  ${featured.map(proj => `
    <div class="entry">
      <span class="entry-title">${esc(proj.name)}</span>
      ${proj.techStack.length > 0 ? `<span class="project-tech">  ${proj.techStack.map(esc).join(', ')}</span>` : ''}
    </div>
    ${proj.bullets.filter(b => b.trim() && b.trim() !== '<p></p>').length > 0 ? `<ul class="bullet-list">${proj.bullets.filter(b => b.trim() && b.trim() !== '<p></p>').map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
  `).join('\n')}` : ''}

  ${nonEmptySkills.length > 0 ? `
  <div class="section-heading">Skills</div>
  ${nonEmptySkills.map(cat => `
    <div class="entry">
      <span class="skill-cat">${esc(cat.name)}:</span>
      <span class="skill-items">${cat.skills.map(esc).join(', ')}</span>
    </div>
  `).join('\n')}` : ''}
</body>
</html>`;
}

/**
 * Generate a PDF by returning the HTML for the client to print via window.print().
 * This avoids the puppeteer dependency entirely.
 */
export async function buildPdf(data: ResumeData): Promise<Buffer> {
  const html = buildResumeHTML(data);
  return Buffer.from(html, 'utf-8');
}
