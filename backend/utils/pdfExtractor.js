import fs from 'fs';
import * as pdfParseLib from 'pdf-parse';

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    const legacyFn =
      typeof pdfParseLib.default === 'function'
        ? pdfParseLib.default
        : typeof pdfParseLib.pdfParse === 'function'
        ? pdfParseLib.pdfParse
        : null;

    let data;
    if (legacyFn) {
      data = await legacyFn(dataBuffer);
    } else if (typeof pdfParseLib.PDFParse === 'function') {
      const parser = new pdfParseLib.PDFParse({ data: dataBuffer });
      try {
        data = await parser.getText();
      } finally {
        await parser.destroy();
      }
    } else {
      throw new Error('Unsupported pdf-parse export shape in runtime');
    }

    // pdf-parse returns text as a single string, we need to split by pages
    // For basic implementation, we'll return the full text as one page
    // In a real implementation, you'd need a more sophisticated PDF parser
    const fullText = data.text;

    // Simple page detection (this is a basic approximation)
    const pages = fullText.split(/\f|\n\s*\n\s*\n/).filter(page => page.trim());

    return pages.map((text, index) => ({
      page: index + 1,
      text: text.trim()
    }));
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

export default extractTextFromPDF;
