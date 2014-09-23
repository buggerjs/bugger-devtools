#!/usr/bin/env node
'use strict';

var program = require('commander');

program
  .version(require('../package.json').version)
  .option('-p, --port [port]', 'Port to listen to, default: 8058')
  .parse(process.argv);

var devTools = require('..');
devTools().listen(program.port || 8058);
