#!/usr/bin/env bash

tsc -d -p . --outDir dist

export NODE_PATH=dist

node dist/testRoundtrip.js ./SBOLTestSuite/SBOL2/BBa_I0462.xml

#meld ./SBOLTestSuite/SBOL2/BBa_I0462.xml ./SBOLTestSuite/SBOL2/BBa_I0462.xml_rs.xml


