[![Build Status](https://img.shields.io/travis/maximsmol/webShortener.svg)](https://travis-ci.org/maximsmol/webShortener) [![Coverage Status](https://img.shields.io/coveralls/maximsmol/webShortener.svg)](https://coveralls.io/r/maximsmol/webShortener?branch=master) [![Issues Count](https://img.shields.io/github/issues/maximsmol/webShortener.svg)](https://github.com/maximsmol/webShortener/)
[![Dependencies Status](https://img.shields.io/requires/github/maximsmol/webShortener.svg)](https://www.npmjs.com/package/webshortener) [![Downloads Count](https://img.shields.io/npm/dm/webshortener.svg)](https://www.npmjs.com/package/webshortener) [![NPM License Status](https://img.shields.io/npm/l/webshortener.svg)](https://www.npmjs.com/package/webshortener)

# webShortener
Utility for shortening ids and classnames.

## Installation
`npm install -g webshortener`

## Usage
### CLI
`webshortener [-h path] [--html path] [-c path] [--css path] [-j path] [--js path] [-o path] [--output path] path ...`
More at `man webshortener`

### As a library
#### API
1. A container for information common to all streams
	`new Shortener();`
1. Shortener streams for different file types
	* `new Shortener().htmlShortener`
	* `new Shortener().cssShortener`
	* `new Shortener().jsShortener`

#### Example
```js
var Shortener = require('webShortener');

var shrtnr = new Shortener();

fs.createReadStream('./index.html').pipe(shrtnr.htmlShortener())
.on('error', function(err)
{
	console.err(err);
	process.exit(1);
})
.pipe(fs.createWriteStream('./index.html.parsed'));
.on('finish', function()
{
	console.log('Finished parsing index.html');
})
```

### What gets replaced
1. In HTML files *id* and *class* attributes get replaced
1. In CSS files selectors, containing *ids* and *classes* get shortened
1. In JS files *special comments* get replaced
	`/* webname .class */`, `/* webname #id */`

## Replacement generation
Replacement for ids and classnames is generated separately.
E.X. `id='a' class='a'`, not `id='a' class='b'`

A replacement is guaranteed to be the shortest one available, while it being unique.
