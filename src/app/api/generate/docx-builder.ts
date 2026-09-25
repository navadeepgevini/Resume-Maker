import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
} from 'docx';

import type { ResumeData } from '@/types/resume';
import { PAGE_TWIPS, PAGE_MARGINS_TWIPS } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const NONE_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const NO_BORDERS = {
  top: NONE_BORDER,
  bottom: NONE_BORDER,
  left: NONE_BORDER,
  right: NONE_BORDER,
};

/** Create a section heading like "EDUCATION" with letter-spacing + hairline rule */
function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E4E4DF', space: 4 },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        font: 'Calibri',
        size: 21, // 10.5pt
        characterSpacing: 60,
        color: '1C1C1A',
      }),
    ],
  });
}

/** Pipe separator for the contact row */
function pipeSep(): TextRun {
  return new TextRun({
    text: '  |  ',
    font: 'Calibri',
    size: 18,
    color: 'CCCCCC',
  });
}

/* ------------------------------------------------------------------ */
/*  Build the .docx document                                          */
/* ------------------------------------------------------------------ */

export async function buildDocx(data: ResumeData): Promise<Buffer> {
  const pageDims = PAGE_TWIPS[data.settings.pageSize];
  const children: (Paragraph | Table)[] = [];

  /* ---- Header ---- */
  const hasPhoto =
    data.settings.showPhoto &&
    data.personal.showPhoto &&
    data.personal.photo &&
    data.personal.photo.length > 10;

  if (hasPhoto) {
    // Decode base64 photo
    const base64 = data.personal.photo.replace(
      /^data:image\/\w+;base64,/,
      '',
    );
    const imgBuffer = Buffer.from(base64, 'base64');

    children.push(
      new Table({
        rows: [
          new TableRow({
            children: [
              // Headshot cell
              new TableCell({
                width: { size: 12, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imgBuffer,
                        transformation: { width: 72, height: 72 },
                        type: 'jpg',
                      }),
                    ],
                  }),
                ],
              }),
              // Name + headline cell
              new TableCell({
                borders: NO_BORDERS,
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: data.personal.fullName,
                        bold: true,
                        font: 'Calibri',
                        size: 44, // 22pt
                        color: '1C1C1A',
                      }),
                    ],
                  }),
                  ...(data.personal.headline
                    ? [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: data.personal.headline,
                              font: 'Calibri',
                              size: 22, // 11pt
                              color: '6B6B63',
                            }),
                          ],
                        }),
                      ]
                    : []),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  } else {
    // No photo — just name + headline
    children.push(
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: data.personal.fullName,
            bold: true,
            font: 'Calibri',
            size: 44,
            color: '1C1C1A',
          }),
        ],
      }),
    );
    if (data.personal.headline) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.personal.headline,
              font: 'Calibri',
              size: 22,
              color: '6B6B63',
            }),
          ],
        }),
      );
    }
  }

  /* ---- Contact Row ---- */
  const contactParts: TextRun[] = [];

  const addContactItem = (text: string) => {
    if (contactParts.length > 0) {
      contactParts.push(pipeSep());
    }
    contactParts.push(
      new TextRun({
        text,
        font: 'Calibri',
        size: 18, // 9pt
        color: '6B6B63',
      }),
    );
  };

  if (data.personal.email) addContactItem(data.personal.email);
  if (data.personal.phone) addContactItem(data.personal.phone);
  if (data.personal.cityState) addContactItem(data.personal.cityState);
  if (data.links.linkedin) addContactItem(data.links.linkedin);
  if (data.links.github) addContactItem(`github.com/${data.links.github}`);
  if (data.links.leetcode) addContactItem(data.links.leetcode);
  if (data.links.codeforces) addContactItem(data.links.codeforces);
  if (data.links.hackerrank) addContactItem(data.links.hackerrank);
  if (data.links.personalSite) addContactItem(data.links.personalSite);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        alignment: AlignmentType.CENTER,
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: 'E4E4DF',
            space: 6,
          },
        },
        children: contactParts,
      }),
    );
  }

  /* ---- Education ---- */
  if (data.education.length > 0) {
    children.push(sectionHeading('Education'));

    for (const edu of data.education) {
      const parts: TextRun[] = [
        new TextRun({
          text: edu.institution,
          bold: true,
          font: 'Calibri',
          size: 20, // 10pt
        }),
      ];

      const details: string[] = [];
      if (edu.degree) details.push(edu.degree);
      if (edu.startYear && edu.endYear)
        details.push(`${edu.startYear}–${edu.endYear}`);
      if (edu.gradeValue) {
        const label = edu.gradeType === 'cgpa' ? 'CGPA' : '%';
        details.push(`${edu.gradeValue} ${label}`);
      }

      if (details.length > 0) {
        parts.push(
          new TextRun({
            text: ` — ${details.join('  |  ')}`,
            font: 'Calibri',
            size: 20,
            color: '6B6B63',
          }),
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: parts,
        }),
      );
    }
  }

  /* ---- Certifications ---- */
  if (data.certifications.length > 0) {
    children.push(sectionHeading('Certifications'));

    for (const cert of data.certifications) {
      const parts: TextRun[] = [
        new TextRun({
          text: cert.title,
          bold: true,
          font: 'Calibri',
          size: 20,
        }),
      ];

      const details: string[] = [];
      if (cert.issuer) details.push(cert.issuer);
      if (cert.completionDate) details.push(cert.completionDate);

      if (details.length > 0) {
        parts.push(
          new TextRun({
            text: ` — ${details.join('  |  ')}`,
            font: 'Calibri',
            size: 20,
            color: '6B6B63',
          }),
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: parts,
        }),
      );
    }
  }

  /* ---- Experience ---- */
  if (data.experience && data.experience.length > 0) {
    children.push(sectionHeading('Experience'));

    for (const exp of data.experience) {
      const headerRuns: TextRun[] = [
        new TextRun({
          text: exp.company,
          bold: true,
          font: 'Calibri',
          size: 20,
        }),
        new TextRun({
          text: `  ${exp.role}`,
          font: 'Calibri',
          italics: true,
          size: 20,
        }),
      ];

      if (exp.startDate && exp.endDate) {
        headerRuns.push(
          new TextRun({
            text: `  |  ${exp.startDate} – ${exp.endDate}`,
            font: 'Calibri',
            size: 18,
            color: '6B6B63',
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: headerRuns,
        })
      );

      for (const bullet of exp.bullets) {
        if (!bullet.trim() || bullet.trim() === '<p></p>') continue;
        const cleanBullet = bullet.replace(/<[^>]+>/g, '');
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 20 },
            children: [
              new TextRun({
                text: cleanBullet,
                font: 'Calibri',
                size: 20,
              }),
            ],
          })
        );
      }
    }
  }

  /* ---- Projects (featured only) ---- */
  const featured = data.projects.filter((p) => p.featured);
  if (featured.length > 0) {
    children.push(sectionHeading('Projects'));

    for (const proj of featured) {
      // Project name + tech stack
      const headerRuns: TextRun[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          font: 'Calibri',
          size: 20,
        }),
      ];

      if (proj.techStack.length > 0) {
        headerRuns.push(
          new TextRun({
            text: `  ${proj.techStack.join(', ')}`,
            font: 'Courier New',
            size: 18, // 9pt
            color: '6B6B63',
          }),
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: headerRuns,
        }),
      );

      // Bullet points
      for (const bullet of proj.bullets) {
        if (!bullet.trim() || bullet.trim() === '<p></p>') continue;
        const cleanBullet = bullet.replace(/<[^>]+>/g, '');
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 20 },
            children: [
              new TextRun({
                text: cleanBullet,
                font: 'Calibri',
                size: 20,
              }),
            ],
          }),
        );
      }
    }
  }

  /* ---- Skills ---- */
  const nonEmptySkills = data.skills.filter((c) => c.skills.length > 0);
  if (nonEmptySkills.length > 0) {
    children.push(sectionHeading('Skills'));

    for (const cat of nonEmptySkills) {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${cat.name}: `,
              bold: true,
              font: 'Calibri',
              size: 20,
            }),
            new TextRun({
              text: cat.skills.join(', '),
              font: 'Courier New',
              size: 18,
            }),
          ],
        }),
      );
    }
  }

  /* ---- Assemble Document ---- */
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              after: 60,
              line: 264, // ~1.1x spacing
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: pageDims.width,
              height: pageDims.height,
            },
            margin: {
              top: PAGE_MARGINS_TWIPS,
              right: PAGE_MARGINS_TWIPS,
              bottom: PAGE_MARGINS_TWIPS,
              left: PAGE_MARGINS_TWIPS,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
