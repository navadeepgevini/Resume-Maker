export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const mod = await import('pdf-parse');
  const pdfParse = (mod as unknown as { default?: (buf: Buffer) => Promise<{ text: string }> }).default ?? (mod as unknown as (buf: Buffer) => Promise<{ text: string }>);
  const result = await pdfParse(buffer);
  return result.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
