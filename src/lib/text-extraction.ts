// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof globalThis !== 'undefined' && !(globalThis as any).DOMMatrix) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = class DOMMatrix {
    constructor() {}
    preMultiplySelf() { return this; }
    invertSelf() { return this; }
    multiplySelf() { return this; }
    translate() { return this; }
    scale() { return this; }
  };
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    verbosity: 0,
  });
  const result = await parser.getText();
  return result.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
