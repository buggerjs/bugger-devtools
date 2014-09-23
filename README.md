# Bugger: Devtools

This repo is a 1:1 copy of the devtools source code that is part of Blink.
The main reason for having this repository is to have a stable version
that can be tested against bugger.

The general goal is to have bugger always work against current Chrome.

If you checked this repo out next to blink,
you can regenerate the `/devtools` directory using `make clean build`.


## Usage

### CLI

```bash
bugger-devtools # start listening on port 8058 (default)
bugger-devtools --port 8080 # start listening on port 8080
bugger-devtools -p 8080 # same as above
```


### Module

```js
// hacky, lazy interface
require('bugger-devtools').listen(myPort);

// clean request listener
require('http').createServer(require('bugger-devtools'))
  .listen(myPort);
```
