import pdfParse from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
