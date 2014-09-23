'use strict';

var http = require('http');
var path = require('path');

var send = require('send');

module.exports = function buggerDevtools() {
  var rootPath = path.join(__dirname, 'devtools');

  function onRequest(req, res) {
    var pathname = req.url.split('?')[0];
    if (pathname.indexOf('/devtools/') !== 0) {
      res.writeHead(302, {
        'Location': '/devtools/devtools.html'
      });
      res.end();
    }
    pathname = pathname.replace(/^\/devtools/, '');
    send(req, pathname, {
      root: rootPath,
      index: []
    }).pipe(res);
  }

  onRequest.listen = function() {
    var server = http.createServer(onRequest);
    server.listen.apply(server, arguments);
    return server;
  };

  return onRequest;
};
