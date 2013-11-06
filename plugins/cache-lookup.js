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

	function cacheMiss (message) {
		console.log ('CACHE MISS FOR: ' + req.host + ' ' + req.url + (message ? ' DUE: ' + message : ''));
		api.notify();
	}

	function cacheFileName (req) {
		var shasum = crypto.createHash('sha1');
		shasum.update(req.url);
		var fileName = path.resolve (process.env['HOXY_CACHE'] || '', 'cache', req.hostname + '-' + req.port + '-' + shasum.digest('hex'));
		var ext = req.url.match (/\.[^\/]{1,10}$/);
		return [fileName, ext];
	}

	var fileName = cacheFileName (req);

	var dataFileName = fileName[0]+'.data' + (fileName[1] ? '.'+fileName[1] : '');
	var metaFileName = fileName[0]+'.meta';
	fs.readFile (metaFileName, function (err, headerData) {
		if (err) {
			// ignore everything
			cacheMiss('NO METAFILE');
			return;
		}
		// console.log (stats);

		var headers;
		var statusCode;
		try {
			var headerDataJSON = JSON.parse (headerData);
			statusCode = headerDataJSON[0];
			headers    = headerDataJSON[1];
		} catch (err) {
			cacheMiss('CANNOT PARSE HEADERS');
			return;
		}

		if (statusCode == 302) {
			api.setResponseInfo ({
				headers: headers,
				statusCode: statusCode,
				body: [' ']
			});
			api.notify();
			return;
		}

		fs.readFile (dataFileName, function (err, fileData) {
			if (err) {
				cacheMiss('DATA FILE ERROR');
				return;

			}
			console.log ('CACHE HIT FOR: ' + req.host + ' ' + req.url);
			api.setResponseInfo ({
				headers: headers,
				statusCode: statusCode,
				body: [fileData]
			});
			api.notify();	
		});

		
	})

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
};
