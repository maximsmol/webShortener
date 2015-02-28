'use strict';

var fs = require('fs');

var HTMLShortener = require('./htmlShortener');
var CSSShortener  = require('./cssShortener');
var JSShortener   = require('./jsShortener');

var Shortener = function()
{
	this._idIdParams =
	{
		lastId: 0,
		idLen: 1
	};
	this._classIdParams =
	{
		lastId: 0,
		idLen: 1
	};

	this._idMap = {};
	this._classMap = {};
};

Shortener.prototype.htmlShortener = function()
{
	return new HTMLShortener(this);
};

Shortener.prototype.cssShortener = function()
{
	return new CSSShortener(this);
};

Shortener.prototype.jsShortener = function()
{
	return new JSShortener(this);
};

module.exports = Shortener;
