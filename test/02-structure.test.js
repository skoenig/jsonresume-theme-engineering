const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const pdfHelper = require('./utils/pdf-helper');

describe('Structure and Metadata', function () {
  before(function (done) {
    if (process.env.CI === 'true') {
      console.log('Skipping Structure and Metadata tests in CI environment');
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

  it('should have consistent PDF metadata', async function () {
    const pdfToTest = pdfHelper.getPdfPathForTesting();
    const dataBuffer = fs.readFileSync(pdfToTest);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getInfo({ parsePageInfo: true });
    await parser.destroy();

    const pageCount = data.total;
    assert(pageCount >= 1, 'PDF should have at least 1 page');
    assert(
      pageCount <= 3,
      'PDF should not have more than 3 pages for a typical resume',
    );

    assert(data.info && data.info.Title, 'PDF metadata should include a Title');
  });

  it('should have sections in a logical order', async function () {
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

    // Get the position of the name in the text
    const namePos = text.indexOf(resume.basics.name);
    assert(namePos !== -1, 'Name should be present');

    // Define possible section headers
    const sectionHeaders = [
      'Work Experience',
      'Experience',
      'Employment',
      'Education',
      'Skills',
      'Projects',
    ];

    // Find positions of each section header in the text
    const positions = {};
    sectionHeaders.forEach((header) => {
      const pos = text.indexOf(header);
      if (pos !== -1) {
        positions[header] = pos;
      }
    });

    // Check that we found at least some sections
    assert(
      Object.keys(positions).length >= 1,
      'At least 1 section header should be present',
    );

    // Check that name appears before any section
    for (const [header, pos] of Object.entries(positions)) {
      assert(
        namePos < pos,
        `Name should appear before the "${header}" section`,
      );
    }
  });
});
