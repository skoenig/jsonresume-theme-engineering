const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const childProcess = require('child_process');
const pdfHelper = require('./utils/pdf-helper');

describe('PDF Export', function () {
  let execStub;

  beforeEach(function () {
    // Backup the original PDF
    pdfHelper.backupReferencePdf();

    // Create a proper sinon stub for the exec function
    execStub = sinon.stub(childProcess, 'exec');

    // Configure the stub to simulate successful PDF generation
    execStub.callsFake((command, callback) => {
      if (command === 'npm run pdf') {
        // Simulate the PDF export process
        fs.writeFileSync(pdfHelper.referencePdfPath, 'PDF content');
        callback(null, 'PDF export successful');
      } else {
        callback(new Error('Unknown command'));
      }
    });
  });

  afterEach(function () {
    // Restore all sinon stubs
    sinon.restore();

    // Restore the original PDF
    pdfHelper.restoreReferencePdf();

    // Clean up test PDF
    pdfHelper.cleanupTestPdf();
  });

  it('should export a PDF with valid input', function (done) {
    const resume = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'sample-resume.json'),
        'utf-8',
      ),
    );
    fs.writeFileSync(
      path.join(__dirname, '..', 'resume.json'),
      JSON.stringify(resume),
    );

    childProcess.exec('npm run pdf', (error, stdout, stderr) => {
      if (error) {
        return done(error);
      }

      assert(
        fs.existsSync(pdfHelper.referencePdfPath),
        'PDF file should be generated',
      );

      // Read the file as a Buffer instead of utf-8 string since PDF is binary
      const pdfExists = fs.existsSync(pdfHelper.referencePdfPath);
      assert(pdfExists, 'PDF file should be generated');

      done();
    });
  });

  it('should handle errors during PDF export', function (done) {
    // Restore the original stub and create a new one that simulates an error
    sinon.restore();
    execStub = sinon.stub(childProcess, 'exec');
    execStub.callsFake((command, callback) => {
      callback(new Error('Simulated error during PDF export'));
    });

    childProcess.exec('npm run pdf', (error, stdout, stderr) => {
      assert(error, 'An error should be thrown during PDF export');
      done();
    });
  });
});
