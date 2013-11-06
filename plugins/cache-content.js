/*
Written by Greg Reimer
Copyright (c) 2010
http://github.com/greim
*/

/**
Adds a banner to the top of an html page showing a message.
usage: @banner('hey, this is a banner!')
*/

var crypto = require ('crypto');
var fs     = require ('fs');
var path   = require ('path');

exports.run = function(api){
	var res = api.getResponseInfo();
	var req = api.getRequestInfo();

	function cacheFileName (req) {
		var shasum = crypto.createHash('sha1');
		shasum.update(req.url);
		var fileName = path.resolve (process.env['HOXY_CACHE'] || '', 'cache', req.hostname + '-' + req.port + '-' + shasum.digest('hex'));
		var ext = req.url.match (/\.[^\/]{1,10}$/);
		return [fileName, ext];
	}

	if (res.statusCode == 200) {
		
		var fileName = cacheFileName (req);

		var wm = fs.WriteStream (fileName[0]+'.meta');
		wm.write (JSON.stringify ([res.statusCode, res.headers]));
		wm.end ();

		var w = fs.WriteStream (fileName[0]+'.data' + (fileName[1] ? '.'+fileName[1] : ''));
		res.body.forEach (function (chunk){
			w.write (chunk);
		});
		w.end();
	} else if (res.statusCode == 206) {
		// console.log (req.headers);
		// console.log (res.headers);
		var fileName = cacheFileName (req);

		var wm = fs.WriteStream (fileName[0]+'.meta');
		wm.write (JSON.stringify ([res.statusCode, res.headers]));
		wm.end ();

		var w = fs.WriteStream (fileName[0]+'.data' + (fileName[1] ? '.'+fileName[1] : ''));
		res.body.forEach (function (chunk){
			w.write (chunk);
		});
		w.end();
	} else if (res.statusCode == 302) {
		// console.log (req.headers);
		// console.log (res.headers);
		var fileName = cacheFileName (req);

		var wm = fs.WriteStream (fileName[0]+'.meta');
		wm.write (JSON.stringify ([res.statusCode, res.headers]));
		wm.end ();

		// var w = fs.WriteStream (fileName[0]+'.data' + (fileName[1] ? '.'+fileName[1] : ''));
		// res.body.forEach (function (chunk){
		// 	w.write (chunk);
		// });
		// w.end();


	} else {
		console.log (req.url + ' ignored due status code: ' + res.statusCode);

	}
// requestInfo.method
// requestInfo.headers
// requestInfo.url
// requestInfo.hostname
// requestInfo.port
// requestInfo.body

// responseInfo.headers
// responseInfo.statusCode
// responseInfo.body
// responseInfo.throttle

	api.notify();
};
