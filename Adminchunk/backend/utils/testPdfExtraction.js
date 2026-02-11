const extractTextFromPDF = require('./pdfExtractor');
const path = require('path');
const logger = require('./logger');

const testPdfExtraction = async () => {
  console.log('=== PDF Text Extraction Testing ===\n');

  // Test 2.1: Text Integrity Check
  console.log('TODO 2.1 – Text Integrity Check');
  try {
    const testPdfPath = path.join(__dirname, '../uploads/sops/test_sop.pdf');
    const pageWiseText = await extractTextFromPDF(testPdfPath);

    console.log(`Extracted ${pageWiseText.length} pages`);

    // Check if text is readable (not empty and contains meaningful content)
    let totalText = '';
    pageWiseText.forEach((page, index) => {
      console.log(`Page ${page.page}: ${page.text.length} characters`);
      totalText += page.text + ' ';
    });

    // Log first 500 characters
    const first500Chars = totalText.substring(0, 500);
    console.log('\nFirst 500 characters of extracted text:');
    console.log('---');
    console.log(first500Chars);
    console.log('---');

    if (totalText.trim().length > 0) {
      console.log('✅ Text extraction successful - readable content found\n');
    } else {
      console.log('❌ Text extraction failed - no readable content\n');
    }

    // Test 2.3: Scanned PDF Test (simulate with our simple PDF)
    console.log('TODO 2.3 – Scanned PDF Test');
    // Our test PDF is text-based, so it should extract properly
    // In a real scenario, scanned PDFs would have OCR issues
    if (totalText.includes('garbage') || totalText.trim().length === 0) {
      console.log('⚠️ Warning: OCR required - extracted text appears to be garbage or empty');
    } else {
      console.log('✅ Text extraction successful - no OCR issues detected');
    }

  } catch (error) {
    console.error('❌ PDF extraction test failed:', error.message);
  }

  console.log('=== PDF Text Extraction Testing Complete ===');
};

// Run test if this file is executed directly
if (require.main === module) {
  testPdfExtraction().catch(console.error);
}

module.exports = { testPdfExtraction };
