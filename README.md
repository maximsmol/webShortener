[![Build Status](https://img.shields.io/travis/maximsmol/webShortener.svg)](https://travis-ci.org/maximsmol/webShortener) [![Coverage Status](https://img.shields.io/coveralls/maximsmol/webShortener.svg)](https://coveralls.io/r/maximsmol/webShortener?branch=master) [![Issues Count](https://img.shields.io/github/issues/maximsmol/webShortener.svg)](https://github.com/maximsmol/webShortener/)
[![Dependencies Status](https://img.shields.io/requires/github/maximsmol/webShortener.svg)](https://www.npmjs.com/package/webshortener) [![Downloads Count](https://img.shields.io/npm/dm/webshortener.svg)](https://www.npmjs.com/package/webshortener) [![NPM License Status](https://img.shields.io/npm/l/webshortener.svg)](https://www.npmjs.com/package/webshortener)

# webShortener
Utility for shortening ids and classnames.

## How it works
1. For HTML files all id and class attributes get a replacement and are added to the database.

1. For CSS files all classes and ids, that were not found in the markup get a replacement and are added to the database. This is done, because one may not use a class in the markup, but may use it in a tag generated via JS.

1. For JS files special comments are used to indicate, that a substitution is to be made.
```js
console.log('Hello, .class became /* webname .class */');
```
becomes
```js
console.log('Hello, .class became abc');
```

## Replacement generation
Replacement for ids and classnames is generated separately.
E.X. `id='a' class='a'`, not `id='a' class='b'`

A replacement is guaranteed to be the shortest one available, while it being unique.

## CLI
See `man webshorten`
