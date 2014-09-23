'use strict';

var http = require('http');
var path = require('path');

var send = require('send');

module.exports = function buggerDevtools() {
  var rootPath = path.join(__dirname, 'devtools');

  function onRequest(req, res) {
    send(req, req.url, {
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
