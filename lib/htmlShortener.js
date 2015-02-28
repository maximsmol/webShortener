'use strict';

var util = require('util');
var stream = require('stream');

var shortUtil = require('./shortUtil');

var HTMLShortener = function(shrtnr, options)
{
	stream.Transform.call(this, options);

	this._inTag = false;
	this._skip = false;
	this._attrName = '';
	this._attrValue = '';

	this._shrtnr = shrtnr;
};
util.inherits(HTMLShortener, stream.Transform);

HTMLShortener.prototype._dropId = function()
{
	this.push(this._attrName);
	this._attrName = '';
	this._skip = true;
};

HTMLShortener.prototype._genId = function()
{
	if (this._attrName === 'id')
	{
		var id = '';
		if (this._shrtnr._idMap[this._attrValue] != null)
		{
			id = this._shrtnr._idMap[this._attrValue];
		}
		else
		{
			id = shortUtil.nextId(this._shrtnr._idIdParams);
			this._shrtnr._idMap[this._attrValue] = id;
		}

		this.push(id);
	}
	else if (this._attrName === 'class')
	{
		var id = '';
		if (this._shrtnr._classMap[this._attrValue] != null)
		{
			id = this._shrtnr._classMap[this._attrValue];
		}
		else
		{
			id = shortUtil.nextId(this._shrtnr._classIdParams);
			this._shrtnr._classMap[this._attrValue] = id;
		}

		this.push(id);
	}

	this._attrValue = '';
};

HTMLShortener.prototype._transform = function(chunk, encoding, done)
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
			curChar === '<'  ||
			curChar === '\'' ||
			curChar === '"') this._skip = false;
		if (this._skip)
		{
			this.push(str[i]);
			continue;
		}

		if (curChar === '<')
		{
			this._inTag = true;
			this._skip = true;

			this.push('<');
			continue;
		}
		if (curChar === '>')
		{
			this._inTag = true;

			this.push('>');
			continue;
		}
		if (!this._inTag)
		{
			this.push(str[i]);
			continue;
		}

		if (curChar === ' '  ||
			curChar === '\n' ||
			curChar === '\r' ||
			curChar === '\t')
		{
			if (this._inAttr) this._genId();

			this.push(str[i]);
			continue;
		}

		if (curChar === '\'' || curChar === '"')
		{
			if (this._inAttr)
			{
				this._genId();
				this._attrName = '';
				this._inAttr = false;
			}
			else if (this._readValue)
			{
				this._inAttr = true;
				this._readValue = false;
			}

			this.push(str[i]);
			continue;
		}
		if (this._inAttr)
		{
			this._attrValue += str[i];
			continue;
		}

		if (curChar === '=')
		{
			if (this._attrName === 'id' || this._attrName === 'class')
			{
				this.push(this._attrName);
				this._readValue = true;
			}
			else
			{
				this.push(this._attrName);
				this._attrName = '';
				this._skip = true;
			}
			this.push('=');
			continue;
		}

		switch (this._attrName.length)
		{
			case 0:
				if (curChar === 'i' || curChar === 'c')
				{
					this._attrName += curChar;
					continue;
				}
				else
					this._dropId();
				break;
			case 1:
				if (curChar === 'd' || curChar === 'l')
				{
					this._attrName += curChar;
					continue;
				}
				else
					this._dropId();
				break;
			case 2:
				if (curChar === 'a')
				{
					this._attrName += 'a';
					continue;
				}
				else
					this._dropId();
				break;
			case 3:
				if (curChar === 's')
				{
					this._attrName += 's';
					continue;
				}
				else
					this._dropId();
				break;
			case 4:
				if (curChar === 's')
				{
					this._attrName += 's';
					continue;
				}
				else
					this._dropId();
				break;
		}
		if (this._attrName.length > 4) this._dropId();

		this.push(str[i]);
	}

	done();
};

module.exports = HTMLShortener;
