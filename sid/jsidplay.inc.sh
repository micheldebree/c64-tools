#!/bin/bash
JSIDPLAY_VERSION=4.8
JSIDPLAY_HOME=./jsidplay2-${JSIDPLAY_VERSION}-mac
HVSC="$HOME/Commodore64/sid/C64Music"

BASENAME="${SID%.*}"

if [ -n "${LENGTH}" ]; then
  LENGTH_PARAM="--defaultLength ${LENGTH}"
fi

JSIDPLAY="java -jar ${JSIDPLAY_HOME}/jsidplay2-console-${JSIDPLAY_VERSION}.jar
-n true \
-e RESIDFP \
-f HIGH \
--sampling RESAMPLE \
--hvsc ${HVSC} \
${LENGTH_PARAM} \
--fadeOut 00:03"
