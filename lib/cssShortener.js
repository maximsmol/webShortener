'use strict';

var util = require('util');
var stream = require('stream');

var shortUtil = require('./shortUtil');

var CSSShortener = function(shrtnr, options)
{
	stream.Transform.call(this, options);

	this._inRule = false;
	this._skip = false;
	this._selector = '';

	this._shrtnr = shrtnr;
};
util.inherits(CSSShortener, stream.Transform);

CSSShortener.prototype._genId = function()
{
	if (this._selector.indexOf('#') === 0)
	{
		var id = '';
		var orig = this._selector.substr(1);
		if (this._shrtnr._idMap[orig] != null)
		{
			id = this._shrtnr._idMap[orig];
		}
		else
		{
			id = shortUtil.nextId(this._shrtnr._idIdParams);
			this._shrtnr._idMap[orig] = id;
		}

		this.push('#'+id);
	}
	else if (this._selector.indexOf('.') === 0)
	{
		var id = '';
		var orig = this._selector.substr(1);
		if (this._shrtnr._classMap[orig] != null)
		{
			id = this._shrtnr._classMap[orig];
		}
		else
		{
			id = shortUtil.nextId(this._shrtnr._classIdParams);
			this._shrtnr._classMap[orig] = id;
		}

		this.push('.'+id);
	}
	else
	{
		this.push(this._selector);
	}

	this._selector = '';
};

CSSShortener.prototype._transform = function(chunk, encoding, done)
{
	if (encoding === 'buffer') encoding = 'utf8';
	var str = chunk.toString(encoding);

	for (var i = 0; i < str.length; i++)
	{
		var curChar = str[i].toLowerCase();

		if (curChar === ' '  ||
			curChar === '\n' ||
			curChar === '\r' ||
			curChar === '\t' ||
			curChar === '{'  ||
			curChar === '(') this._skip = false;
		if (this._skip)
		{
			this.push(str[i]);
			continue;
		}

		if (curChar === '{')
		{
			this._inRule = true;
			this._skip = true;

			this.push('{');
			continue;
		}
		if (curChar === '}')
		{
			this._inRule = false;

			this.push('}');
			continue;
		}
		if (this._inRule)
		{
			this.push(str[i]);
			continue;
		}

		if (curChar === ' '  ||
			curChar === '\n' ||
			curChar === '\r' ||
			curChar === '\t' ||
			curChar === ':'  ||
			curChar === ','  ||
			curChar === ')')
		{
			this._genId();

			if (curChar === ':') this._skip = true;

			this.push(str[i]);
			continue;
		}

		if (curChar === '#' ||
			curChar === '.')
		{
			this._genId();
		}

		this._selector += str[i];
	}

	done();
};

module.exports = CSSShortener;
