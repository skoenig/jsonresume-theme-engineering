const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const pdfParse = require('pdf-parse');
const pdfHelper = require('./utils/pdf-helper');

describe('Accessibility and Usability', function () {
  // Skip all tests in this suite if in CI environment
  before(function (done) {
    if (process.env.CI === 'true') {
      console.log('Skipping Accessibility tests in CI environment');
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
    // Get the appropriate PDF path for testing
    const pdfToTest = pdfHelper.getPdfPathForTesting();

    const stats = fs.statSync(pdfToTest);
    const fileSizeInKB = stats.size / 1024;

    console.log(`PDF file size: ${fileSizeInKB.toFixed(2)} KB`);

    // Check that the file size is reasonable (not too small, not too large)
    assert(fileSizeInKB > 10, 'PDF should not be too small (< 10KB)');
    assert(fileSizeInKB < 1000, 'PDF should not be too large (> 1000KB)');
  });

  it('should have extractable text', function (done) {
    // Get the appropriate PDF path for testing
    const pdfToTest = pdfHelper.getPdfPathForTesting();

    // Read and parse the PDF
    const dataBuffer = fs.readFileSync(pdfToTest);
    pdfParse(dataBuffer)
      .then((data) => {
        const text = data.text;

        // Check that the PDF has extractable text (important for accessibility)
        assert(text.length > 100, 'PDF should have extractable text');

        // Check that the text contains meaningful content
        assert(
          text.split(/\s+/).length > 50,
          'PDF should contain a reasonable amount of text',
        );

        done();
      })
      .catch(done);
  });

  it('should have appropriate metadata', function (done) {
    // Get the appropriate PDF path for testing
    const pdfToTest = pdfHelper.getPdfPathForTesting();

    // Read and parse the PDF
    const dataBuffer = fs.readFileSync(pdfToTest);
    pdfParse(dataBuffer)
      .then((data) => {
        const info = data.info;

        // Check that the PDF has basic metadata
        assert(info, 'PDF should have metadata');

        // Log the metadata for informational purposes
        console.log('PDF metadata:', JSON.stringify(info, null, 2));

        done();
      })
      .catch(done);
  });

  it('should have a reasonable page count', function (done) {
    // Get the appropriate PDF path for testing
    const pdfToTest = pdfHelper.getPdfPathForTesting();

    // Read and parse the PDF
    const dataBuffer = fs.readFileSync(pdfToTest);
    pdfParse(dataBuffer)
      .then((data) => {
        const pageCount = data.numpages;

        console.log(`PDF page count: ${pageCount}`);

        // Check that the PDF has a reasonable number of pages
        assert(pageCount >= 1, 'PDF should have at least 1 page');
        assert(
          pageCount <= 3,
          'PDF should not have more than 3 pages for a typical resume',
        );

        done();
      })
      .catch(done);
  });

  it('should include contact information', function (done) {
    // Get the appropriate PDF path for testing
    const pdfToTest = pdfHelper.getPdfPathForTesting();

    // Read and parse the PDF
    const dataBuffer = fs.readFileSync(pdfToTest);
    pdfParse(dataBuffer)
      .then((data) => {
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

        done();
      })
      .catch(done);
  });
});
