#!/usr/bin/env bash

tsc -d -p ./ --outDir dist/
export NODE_PATH=dist
node dist/testRoundtrip.js | tee log.txt


