# jsonresume-theme-engineering [![](https://badge.fury.io/js/jsonresume-theme-engineering.svg)](https://www.npmjs.org/package/jsonresume-theme-engineering)

This is the engineering theme for [JSON Resume](http://jsonresume.org/), based off of [jsonresume-theme-business-professional-compact](https://github.com/yechoorv/jsonresume-theme-business-professional-compact) and aims to implement the best practices for engineering resumes described in https://www.reddit.com/r/EngineeringResumes/wiki/index/. It is intended for [senior/staff level engineers](https://www.reddit.com/r/EngineeringResumes/wiki/index/#wiki_senior_engineers_and_above_.2810.2B_yoe.29).

<p align="center">
  <kbd>
    <img src="https://github.com/skoenig/jsonresume-theme-engineering/blob/main/resume.png?raw=true" alt="Richard Hendriks Resume"/>
  </kbd>
</p>

## Getting started

To get started with theme development, this is what you'll need:

- [node.js](http://howtonode.org/how-to-install-nodejs)
- [npm](http://howtonode.org/introduction-to-npm)

If you're on Linux, you can simply run:

```
sudo apt-get install nodejs-legacy npm
```

Or if you're on OSX and got [Homebrew](http://brew.sh/) installed:

```
brew install node
```

### Install npm packages

We need to install the dependencies:

```bash
npm install
```

### Render Resume

If you do not provide a `resume.json` at the root directory level, use the sample resume and render it as HTML:

```
cp sample-resume.json resume.json
npm run html
```

You should now see this message:

```
You can find your rendered resume at resume.html. Nice work! 🚀
```

Congratulations, you've made it! You can now start to modify this theme (see Contribute section below).

## PDF Export
To export your resume in PDF format, you can run the following command below. This will automatically create a `resume.pdf` file within your current directory:

```
npm run pdf
```

Alternatively, you can also do a **print page** on the browser and save it as as PDF (by setting margins to none and removing header/footers.)

## Contribute

Currently, this theme is still based on the old [jsonresume-theme-boilerplate](https://github.com/jsonresume/jsonresume-theme-boilerplate), so a look at the README will give you an overview of the files involved in theme modification.

Contributions to the implementation of new functions or bug fixes are very welcome!

## License

Available under [the MIT license](http://mths.be/mit).
