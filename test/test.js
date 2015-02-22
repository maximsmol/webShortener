'use strict';

//
// Standard libraries
var fs = require('fs');
var assert = require('assert');

//
//
var webShortener = require('../lib/webShortener');

//
// Mocha
var describe = global.describe;
var it = global.it;


//
// Main code
//

//
// Tests
describe('Output test', function output()
{
	it('Result should be ideal', function test()
	{
		var htmlFile = './test/assets/index.html';
		var cssFile  = './test/assets/main.css';
		var jsFile   = './test/assets/main.js';

		webShortener([htmlFile], [cssFile], [jsFile]);

		assert.strictEqual(
			fs.readFileSync(htmlFile+'.ideal').toString(),
			fs.readFileSync(htmlFile+'.parsed').toString()
		);
		assert.strictEqual(
			fs.readFileSync(cssFile+'.ideal').toString(),
			fs.readFileSync(cssFile+'.parsed').toString()
		);
		assert.strictEqual(
			fs.readFileSync(jsFile+'.ideal').toString(),
			fs.readFileSync(jsFile+'.parsed').toString()
		);
	});
});

describe('Replacement generator test', function stress()
{
	it('Result should be ideal', function test()
	{
		var htmlFile = './test/assets/generator.html';

		webShortener([htmlFile], [], []);

		assert.strictEqual(
			fs.readFileSync(htmlFile+'.ideal').toString(),
			fs.readFileSync(htmlFile+'.parsed').toString()
		);
	});
});
