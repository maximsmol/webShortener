'use strict';

var util = require('util');
var stream = require('stream');

var shortUtil = require('./shortUtil');

var JSShortener = function(shrtnr, options)
{
	stream.Transform.call(this, options);

	this._buf = '';
	this._id  = '';
	this._commentStart = '';
	this._isWebname = false;
	this._notWebname = false;

	this._shrtnr = shrtnr;
};
util.inherits(JSShortener, stream.Transform);

JSShortener.prototype._genId = function()
{
	if (this._id !== '')
	{
		if (this._id.indexOf('#') === 0)
		{
			var toAdd = this._shrtnr._idMap[this._id.substr(1)];
			//console.log(this._shrtnr._idMap);
			if (toAdd == null || toAdd === '')
				this.emit('error', 'No such id in map: "'+
									this._id.substr(1)+'"');
			this.push(toAdd);
		}
		else if (this._id.indexOf('.') === 0)
		{
			var toAdd = this._shrtnr._classMap[this._id.substr(1)];
			if (toAdd == null || toAdd === '')
				this.emit('error', 'No such class in map: "'+
									this._id.substr(1)+'"');
			this.push(toAdd);
		}
		else
		{
			this.emit('error', 'Invalid webname: "'+this._id+'"');
		}
	}
	this._id = '';
};

JSShortener.prototype._detectedNotWebname = function(str, i)
{
	this.push('/*');
	// commentStart contains an additional character, because it has
	// to be before isWebname check
	this.push(this._commentStart.slice(0, -1));

	this._notWebname = true;

	this.push(this._buf);
	this.push(str[i]);

	this._buf = '';
	this._commentStart = '';
};

JSShortener.prototype._transform = function(chunk, encoding, done)
{
	if (encoding === 'buffer') encoding = 'utf8';
	var str = chunk.toString(encoding);

	for (var i = 0; i < str.length; i++)
	{
		var curChar = str[i].toLowerCase();

		if (!this._inComment)
		{
			if (this._buf === '' && curChar === '/')
			{
				this._buf += '/';
				continue;
			}
			else if (this._buf === '/')
			{
				if (curChar !== '*')
				{
					this._buf = '';
					this.push('/');
					this.push(str[i]);

					continue;
				}

				this._inComment = true;
				this._buf = '';
				continue;
			}
		}

		if (this._inComment)
		{
			if (this._buf === '' && curChar === '*')
			{
				this._buf += '*';
				continue;
			}
			else if (this._buf === '*')
			{
				if (curChar !== '/')
				{
					this._commentStart += ' '; // placeholder character
					this._detectedNotWebname(str, i);
					continue;
				}

				if (this._notWebname)
					this.push('*/');
				else
					this._genId();

				this._inComment = false;
				this._isWebname = false;
				this._notWebname = false;
				this._buf = '';
				this._commentStart = '';
				this._id = '';

				continue;
			}
			if (!this._notWebname && !this._isWebname)
			{
				this._commentStart += str[i];
			}
			if (this._notWebname)
			{
				this.push(str[i]);
				continue;
			}

			if (curChar === ' '  ||
				curChar === '\n' ||
				curChar === '\r' ||
				curChar === '\t')
			{
				if (!this._isWebname) continue;
				this._genId();
				continue;
			}

			if (this._isWebname) ; // Already a webname
			else if (this._buf === '' && curChar === 'w')
			{
				this._buf += 'w';
				continue;
			}
			else if (this._buf === 'w' && curChar === 'e')
			{
				this._buf += 'e';
				continue;
			}
			else if (this._buf === 'we' && curChar === 'b')
			{
				this._buf += 'b';
				continue;
			}
			else if (this._buf === 'web' && curChar === 'n')
			{
				this._buf += 'n';
				continue;
			}
			else if (this._buf === 'webn' && curChar === 'a')
			{
				this._buf += 'a';
				continue;
			}
			else if (this._buf === 'webna' && curChar === 'm')
			{
				this._buf += 'm';
				continue;
			}
			else if (this._buf === 'webnam' && curChar === 'e')
			{
				this._buf += 'e';
				continue;
			}
			else if (this._buf === 'webname')
			{
				this._isWebname = true;
				this._buf = '';
			}
			else
			{
				this._detectedNotWebname(str, i);
				continue;
			}

			if (this._isWebname)
			{
				this._id += str[i];
				continue;
			}
		}

		this.push(str[i]);
	}

	done();
};

module.exports = JSShortener;
