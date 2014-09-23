default: build

build: devtools

clean:
	rm -r devtools

export PATH := $(shell echo `pwd`/build/gyp:$(PATH))
export builddir_name := $(shell echo `pwd`/build/devtools)
devtools: build/gyp
	@rm -rf devtools.tmp && mkdir devtools.tmp
	@cd ../blink/Source/devtools && \
		gyp devtools.gyp --depth=. -f make && \
		make all
	@cp -a build/devtools/Default/resources/inspector/* devtools.tmp
	@mv devtools.tmp devtools

build/gyp:
	git clone --depth 1 https://chromium.googlesource.com/external/gyp.git ./build/gyp
