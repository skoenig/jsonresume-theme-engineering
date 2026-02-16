const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { PDFParse } = require('pdf-parse');
const pdfHelper = require('./utils/pdf-helper');

describe('Content and Accessibility', function () {
  before(function (done) {
    if (process.env.CI === 'true') {
      console.log('Skipping Content and Accessibility tests in CI environment');
      this.skip();
    } else {
      this.timeout(10000);
      pdfHelper.generateTestPdf(done);
    }
  });

  after(function () {
    if (process.env.CI !== 'true') {
      pdfHelper.cleanupTestPdf();
    }
  });

  it('should have a reasonable file size', function () {
    const pdfToTest = pdfHelper.getPdfPathForTesting();

    const stats = fs.statSync(pdfToTest);
    const fileSizeInKB = stats.size / 1024;

    // Check that the file size is reasonable (not too small, not too large)
    assert(fileSizeInKB > 10, 'PDF should not be too small (< 10KB)');
    assert(fileSizeInKB < 1000, 'PDF should not be too large (> 1000KB)');
  });

  it('should have extractable text', async function () {
    const pdfToTest = pdfHelper.getPdfPathForTesting();
    const dataBuffer = fs.readFileSync(pdfToTest);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    await parser.destroy();

    const text = data.text;

    // Check that the PDF has extractable text (important for accessibility)
    assert(text.length > 100, 'PDF should have extractable text');

    // Check that the text contains meaningful content
    assert(
      text.split(/\s+/).length > 50,
      'PDF should contain a reasonable amount of text',
    );
  });

  it('should include contact information', async function () {
    const pdfToTest = pdfHelper.getPdfPathForTesting();
    const dataBuffer = fs.readFileSync(pdfToTest);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    await parser.destroy();

    const text = data.text;
    const resume = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'sample-resume.json'),
        'utf-8',
      ),
    );

    // Check that contact information is included
    assert(text.includes(resume.basics.email), 'Email should be included');

    // Phone might be formatted differently
    const phoneDigits = resume.basics.phone.replace(/\D/g, '');
    const hasPhone =
      text.includes(phoneDigits) ||
      text.includes(phoneDigits.substring(phoneDigits.length - 4));
    assert(hasPhone, 'Phone number should be included');

    // Website might be formatted differently
    const websiteDomain = resume.basics.website
      .replace(/https?:\/\//i, '')
      .replace(/\/$/, '');
    const hasWebsite =
      text.includes(websiteDomain) || text.includes(resume.basics.website);
    assert(hasWebsite, 'Website should be included');
  });

  it('should maintain proper formatting', async function () {
    const pdfToTest = pdfHelper.getPdfPathForTesting();
    const dataBuffer = fs.readFileSync(pdfToTest);

    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    await parser.destroy();

    const text = data.text;

    // Check for formatting patterns
    const datePatterns = [
      /\d{4}\s*-\s*\d{4}/i, // 2014-2016
      /\d{4}\s*-\s*Present/i, // 2014-Present
      /\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{4}/i, // 05/2014-06/2016
      /\d{1,2}\/\d{4}\s*-\s*Present/i, // 05/2014-Present
      /[A-Z][a-z]{2}\s+\d{4}/, // May 2014
    ];

    const hasDatePattern = datePatterns.some((pattern) => text.match(pattern));
    assert(hasDatePattern, 'Some form of date formatting should be present');

    // Check for email pattern
    const emailPattern = /\S+@\S+\.\S+/;
    assert(text.match(emailPattern), 'Email should be properly formatted');
  });
});
