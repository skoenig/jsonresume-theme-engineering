const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Paths
const referencePdfPath = path.join(__dirname, '..', '..', 'resume.pdf');
const testPdfPath = path.join(__dirname, '..', '..', 'test-resume.pdf');

// Save original PDF if it exists
let originalPdfExists = false;
let originalPdfContent = null;

function backupReferencePdf() {
  originalPdfExists = fs.existsSync(referencePdfPath);
  if (originalPdfExists) {
    originalPdfContent = fs.readFileSync(referencePdfPath);
  }
}

function restoreReferencePdf() {
  if (originalPdfExists && originalPdfContent) {
    fs.writeFileSync(referencePdfPath, originalPdfContent);
  } else if (fs.existsSync(referencePdfPath) && !originalPdfExists) {
    fs.unlinkSync(referencePdfPath);
  }
}

function cleanupTestPdf() {
  if (fs.existsSync(testPdfPath)) {
    fs.unlinkSync(testPdfPath);
  }
}

function generateTestPdf(callback) {
  const resume = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '..', '..', 'sample-resume.json'),
      'utf-8',
    ),
  );
  fs.writeFileSync(
    path.join(__dirname, '..', '..', 'resume.json'),
    JSON.stringify(resume),
  );

  // Try to generate a test PDF with a different name using the correct command format
  exec(
    `resumed export --theme jsonresume-theme-engineering --output ${testPdfPath}`,
    (error) => {
      if (error) {
        console.warn(
          'Warning: Could not generate test PDF with custom name: ' +
            error.message +
            ' Trying standard export.',
        );

        // Fall back to standard export command from package.json
        exec('npm run pdf', (stdError) => {
          if (stdError) {
            return callback(
              new Error(
                'Failed to generate PDF for testing: ' + stdError.message,
              ),
            );
          }

          if (!fs.existsSync(referencePdfPath)) {
            return callback(
              new Error(
                'PDF was not generated at expected path: ' + referencePdfPath,
              ),
            );
          }

          callback();
        });
      } else {
        callback();
      }
    },
  );
}

function getPdfPathForTesting() {
  return fs.existsSync(testPdfPath) ? testPdfPath : referencePdfPath;
}

module.exports = {
  referencePdfPath,
  testPdfPath,
  backupReferencePdf,
  restoreReferencePdf,
  cleanupTestPdf,
  generateTestPdf,
  getPdfPathForTesting,
};
