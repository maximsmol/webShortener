'use strict';

//
// Standard libraries
var fs = require('fs');
var assert = require('assert');

//
//
var Shortener = require('../lib/webShortener');

//
// Mocha
var describe = global.describe;
var it = global.it;


//
// Tests
//

describe('Output test', function output()
{
	it('Result should be ideal', function test(done)
	{
		var htmlFile = './test/assets/index.html';
		var cssFile  = './test/assets/main.css';
		var jsFile   = './test/assets/main.js';

		var shrtnr = new Shortener();

		fs.createReadStream(htmlFile).pipe(shrtnr.htmlShortener())
		.pipe(fs.createWriteStream(htmlFile+'.parsed'))
		.on('finish', function()
		{
			fs.createReadStream(cssFile).pipe(shrtnr.cssShortener())
			.pipe(fs.createWriteStream(cssFile+'.parsed'))
			.on('finish', function()
			{
				fs.createReadStream(jsFile).pipe(shrtnr.jsShortener())
				.pipe(fs.createWriteStream(jsFile+'.parsed'))
				.on('finish', function()
				{
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

					done();
				});
			});
		});
	});
});

describe('Replacement generator test', function generator()
{
	it('Result should be ideal', function test(done)
	{
		var htmlFile = './test/assets/generator.html';

		var shrtnr = new Shortener();

		fs.createReadStream(htmlFile).pipe(shrtnr.htmlShortener())
		.pipe(fs.createWriteStream(htmlFile+'.parsed'))
		.on('finish', function()
		{
			assert.strictEqual(
				fs.readFileSync(htmlFile+'.ideal').toString(),
				fs.readFileSync(htmlFile+'.parsed').toString()
			);

			done();
		});
	});
});

describe('Testing errors', function errors()
{
	describe('Testing no id in map', function noId()
	{
		it('Should throw the correct error', function test(done)
		{
			var jsFile = './test/assets/noSuchId.js';

			var shrtnr = new Shortener();

			var s = null;
			s = fs.createReadStream(jsFile).pipe(shrtnr.jsShortener())
			.on('error', function(err)
			{
				assert.strictEqual(err, 'No such id in map: "id"');
				done();
			})
			.pipe(fs.createWriteStream(jsFile+'.parsed'));

			s.on('finish', done);
		});
	});

	describe('Testing no class in map', function noClass()
	{
		it('Should throw the correct error', function test(done)
		{
			var jsFile = './test/assets/noSuchClass.js';

			var shrtnr = new Shortener();

			var s = null;
			s = fs.createReadStream(jsFile).pipe(shrtnr.jsShortener())
			.on('error', function(err)
			{
				assert.strictEqual(err, 'No such class in map: "class"');
				done();
			})
			.pipe(fs.createWriteStream(jsFile+'.parsed'));

			s.on('finish', done);
		});
	});

	describe('Testing no such webname', function noWebname()
	{
		it('Should throw the correct error', function test(done)
		{
			var jsFile = './test/assets/noSuchWebname.js';

			var shrtnr = new Shortener();

			var s = null;
			s = fs.createReadStream(jsFile).pipe(shrtnr.jsShortener())
			.on('error', function(err)
			{
				assert.strictEqual(err, 'Invalid webname: "?test"');
				done();
			})
			.pipe(fs.createWriteStream(jsFile+'.parsed'));

			s.on('finish', done);
		});
	});
});
