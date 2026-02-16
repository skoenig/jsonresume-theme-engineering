const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { render } = require('../index');

describe('Render', function () {
  it('should render a resume with valid input', function () {
    const resume = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'sample-resume.json'),
        'utf-8',
      ),
    );
    const output = render(resume);
    assert(
      output.includes('<title>Richard Hendriks</title>'),
      'Output should include the name from the resume',
    );
  });

  it('should throw an error with invalid input', function () {
    assert.throws(
      () => render(null),
      Error,
      'Expected input to be a valid resume object',
    );
  });

  it('should handle an empty resume object', function () {
    const emptyResume = {};
    const output = render(emptyResume);
    assert(
      output.includes('<title></title>'),
      'Output should handle an empty resume object',
    );
  });

  it('should handle a resume object missing required fields', function () {
    const incompleteResume = {
      basics: {
        name: 'Jane Doe',
      },
    };
    const output = render(incompleteResume);
    assert(
      output.includes('<title>Jane Doe</title>'),
      'Output should handle a resume object missing required fields',
    );
  });

  it('should throw an error with invalid data type', function () {
    assert.throws(
      () => render('invalid input'),
      Error,
      'Expected input to be a valid resume object',
    );
  });

  it('should handle a large resume object', function () {
    const largeResume = {
      basics: {
        name: 'Large Resume',
        label: 'Test',
        email: 'large.resume@example.com',
        phone: '(123) 456-7890',
        website: 'http://example.com',
        summary: 'This is a large resume object.',
        location: {
          address: '123 Main St',
          postalCode: '12345',
          city: 'Anytown',
          countryCode: 'US',
          region: 'CA',
        },
        profiles: [],
      },
      work: Array(1000).fill({
        company: 'Large Company',
        position: 'Software Engineer',
        website: 'http://example.com',
        startDate: '2000-01-01',
        summary: 'Worked on various projects.',
        highlights: ['Highlight 1', 'Highlight 2'],
      }),
      education: [],
      skills: [],
      awards: [],
      publications: [],
      languages: [],
      interests: [],
      references: [],
    };
    const output = render(largeResume);
    assert(
      output.includes('<title>Large Resume</title>'),
      'Output should handle a large resume object',
    );
  });

  it('should handle special characters in fields', function () {
    const specialCharsResume = {
      basics: {
        name: 'Special & Ch@rs',
        label: 'Test',
        email: 'special.chars@example.com',
        phone: '(123) 456-7890',
        website: 'http://example.com',
        summary: 'This is a summary with special characters: &, <, >, ", \'.',
        location: {
          address: '123 Main St',
          postalCode: '12345',
          city: 'Anytown',
          countryCode: 'US',
          region: 'CA',
        },
        profiles: [],
      },
      work: [],
      education: [],
      skills: [],
      awards: [],
      publications: [],
      languages: [],
      interests: [],
      references: [],
    };
    const output = render(specialCharsResume);
    assert(
      output.includes('<title>Special &amp; Ch@rs</title>'),
      'Output should handle special characters in fields',
    );
  });
});
