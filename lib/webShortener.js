'use strict';

//
// Standard libraries
//

var fs = require('fs');


//
// Globals
//

var htmlClassRegex    = /class\s*=\s*["']([\w\-\s]+)["']/gi;
var htmlIdRegex       = /id\s*=\s*["']\s*([\w\-]+)\s*["']/gi;
var cssClassIdRegex   = /([\w\s#,.:\-]+)\s*\{/gi;
var cssExtractIdClass = /[.#][\w\-]+/gi;
var jsIdRegex         = /\/\*\s*webname\s*#([\w\-]+)\s*\*\//gi;

var classMap = {};
var idMap    = {};

var htmlFiles = [];
var cssFiles  = [];
var jsFiles   = [];

var file = '';


//
// Helpers
//

var alphabet = 'abcdefghijklmnopqrstuvwxyz_';
var nextId = function(idParams)
{
	var res = '';

	for (var i = idParams.idLen-1; i >= 0; i--)
	{
		var n = Math.floor( idParams.lastId/Math.pow(alphabet.length, i) );
		res += alphabet[n%alphabet.length];
	}

	idParams.lastId++;
	if (idParams.lastId > Math.pow(alphabet.length, idParams.idLen)-1)
	{
		idParams.idLen++;
		idParams.lastId = 0;
	}

	return res;
};


//
// HTML
//

//
// Map builders
var buildClassMapHTML = function(idParams)
{
	var match = null;
	while ((match = htmlClassRegex.exec(file)) != null)
	{
		var classes = match[1].split(/\s+/);

		for (var i = 0; i < classes.length; i++)
		{
			if (classes[i] === '') continue;

			if (classMap[classes[i]] != null) continue;

			classMap[classes[i]] = nextId(idParams);
		}
	}
};

var buildIdMapHTML = function(idParams)
{
	var match = null;
	while ((match = htmlIdRegex.exec(file)) != null)
	{
		idMap[match[1]] = nextId(idParams);
	}
};


//
// Replacers
var replaceHTMLClasses = function()
{
	var res = file;
	for (var key in classMap)
	{
		if (!classMap.hasOwnProperty(key)) continue;

		var regex =
			new RegExp('(class\\s*=\\s*["\']\\s*(?:[^"\']+\\s)*)'+key+'((?:\\s[^"\']+)*\\s*["\'])', 'gi');
		res = res.replace(regex, '$1'+classMap[key]+'$2');
	}

	return res;
};

var replaceHTMLIds = function()
{
	var res = file;
	for (var key in idMap)
	{
		if (!idMap.hasOwnProperty(key)) continue;

		var regex =
			new RegExp('(id\\s*=\\s*["\']\\s*)'+key+'(\\s*["\'])', 'gi');
		res = res.replace(regex, '$1'+idMap[key]+'$2');
	}

	return res;
};


//
// CSS
//

var buildMapsCSS = function(classIdParams, idIdParams)
{
	var match = null;
	while ((match = cssClassIdRegex.exec(file)) != null)
	{
		var parts = match[1].split(/\s+/);

		for (var i = 0; i < parts.length; i++)
		{
			if (parts[i] === '') continue;

			var realMatch = null;
			while ((realMatch = cssExtractIdClass.exec(parts[i])) != null)
			{
				var name = realMatch[0];
				if (name.indexOf('#') === 0)
				{
					var id = name.substr(1);
					if (idMap[id] != null) continue;

					idMap[id] = nextId(idIdParams);
				}
				else if (name.indexOf('.') === 0)
				{
					var className = name.substr(1);
					if (classMap[className] != null) continue;

					classMap[className] = nextId(classIdParams);
				}
			}
		}
	}
};

//
// Replacers
var replaceCSSClasses = function()
{
	var res = file;
	for (var key in classMap)
	{
		if (!classMap.hasOwnProperty(key)) continue;

		res = res.replace(new RegExp('\\.'+key, 'g'), '.'+classMap[key]);
	}

	return res;
};

var replaceCSSIds = function()
{
	var res = file;
	for (var key in idMap)
	{
		if (!idMap.hasOwnProperty(key)) continue;

		res = res.replace(new RegExp('#'+key, 'g'), '#'+idMap[key]);
	}

	return res;
};


//
// JS
//

var replaceJSWebNames = function()
{
	var res = file;
	for (var key in classMap)
	{
		if (!classMap.hasOwnProperty(key)) continue;

		var regex = new RegExp('/\\*\\s*webname\\s*\\.'+key+'\\s*\\*/', 'g');
		res = res.replace(regex, classMap[key]);
	}

	for (key in idMap)
	{
		if (!idMap.hasOwnProperty(key)) continue;

		regex = new RegExp('/\\*\\s*webname\\s*\\#'+key+'\\s*\\*/', 'g');
		res = res.replace(regex, idMap[key]);
	}

	return res;
};


//
// Main Code
//

var work = function()
{
	var classIdParams = {lastId: 0, idLen: 1};
	var idIdParams = {lastId: 0, idLen: 1};

	for (var i = 0; i < htmlFiles.length; i++)
	{
		file = fs.readFileSync(htmlFiles[i]).toString();

		buildClassMapHTML(classIdParams);
		buildIdMapHTML(idIdParams);

		file = replaceHTMLClasses();
		fs.writeFileSync(htmlFiles[i]+'.parsed', replaceHTMLIds());
	}

	for (i = 0; i < cssFiles.length; i++)
	{
		file = fs.readFileSync(cssFiles[i]).toString();

		buildMapsCSS(classIdParams, idIdParams);

		file = replaceCSSClasses();
		fs.writeFileSync(cssFiles[i]+'.parsed', replaceCSSIds());
	}

	for (i = 0; i < jsFiles.length; i++)
	{
		file = fs.readFileSync(jsFiles[i]).toString();

		fs.writeFileSync(jsFiles[i]+'.parsed', replaceJSWebNames());
	}
};


//
// Startup
//

module.exports = function(htmlF, cssF, jsF)
{
	htmlFiles = htmlF;
	cssFiles = cssF;
	jsFiles = jsF;

	work();
};
