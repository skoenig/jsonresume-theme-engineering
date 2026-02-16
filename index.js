const fs = require('fs'),
  path = require('path'),
  Handlebars = require('handlebars'),
  addressFormat = require('address-format'),
  moment = require('moment');

Handlebars.registerHelper({
  wrapURL: function (url) {
    const wrappedUrl =
      '<a href="' + url + '">' + url.replace(/.*?:\/\//g, '') + '</a>';
    return new Handlebars.SafeString(wrappedUrl);
  },

  wrapMail: function (address) {
    const wrappedAddress =
      '<a href="mailto:' + address + '">' + address + '</a>';
    return new Handlebars.SafeString(wrappedAddress);
  },

  formatAddress: function (address, city, region, postalCode, countryCode) {
    let addressList = addressFormat({
      address: address,
      city: city,
      subdivision: region,
      postalCode: postalCode,
      countryCode: countryCode,
    });

    return addressList.join('<br/>');
  },

  formatDate: function (date) {
    return moment(date).format('MMM YYYY');
  },

  getValueIfDiffFromPrevious: function (array, index, key) {
    return array[index - 1] && array[index][key] === array[index - 1][key]
      ? ''
      : array[index][key];
  },
});

function render(resume) {
  if (!resume || typeof resume !== 'object') {
    throw new Error('Expected input to be a valid resume object');
  }

  let dir = __dirname,
    css = fs.readFileSync(dir + '/style.css', 'utf-8'),
    resumeTemplate = fs.readFileSync(dir + '/resume.hbs', 'utf-8'),
    partialsDir = path.join(dir, 'partials'),
    viewsDir = path.join(dir, 'views');

  // Load partials from partialsDir
  let partialFilenames = fs.readdirSync(partialsDir);
  partialFilenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
      return;
    }
    var name = matches[1];
    var filepath = path.join(partialsDir, filename);
    var template = fs.readFileSync(filepath, 'utf8');

    Handlebars.registerPartial(name, template);
  });

  // Load partials from viewsDir (if it exists)
  try {
    if (fs.existsSync(viewsDir)) {
      let viewFilenames = fs.readdirSync(viewsDir);
      viewFilenames.forEach(function (filename) {
        var matches = /^([^.]+).hbs$/.exec(filename);
        if (!matches) {
          return;
        }
        var name = matches[1];
        var filepath = path.join(viewsDir, filename);
        var template = fs.readFileSync(filepath, 'utf8');

        Handlebars.registerPartial(name, template);
      });
    }
  } catch (err) {
    console.error('Error loading views directory:', err);
  }

  return Handlebars.compile(resumeTemplate)({
    css: css,
    resume: resume,
  });
}

module.exports = {
  render: render,
  pdfRenderOptions: {
    format: 'A4',
    mediaType: 'print',
  },
};
