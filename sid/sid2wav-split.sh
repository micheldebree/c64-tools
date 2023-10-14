#!/bin/bash
set -e
. ./jsidplay.inc.sh
if [ "$#" -ne 2 ]; then
  echo "Split SID tunes into three separate WAV tracks"
  echo "USAGE: $0 <SID file> <song length>"
  exit 0
fi

JSIDPLAY_VERSION=4.6
JSIDPLAY="java -jar ./jsidplay2-${JSIDPLAY_VERSION}-mac/jsidplay2-console-${JSIDPLAY_VERSION}.jar
-n true \
-e RESIDFP \
-f HIGH \
--sampling RESAMPLE \
--fadeOut 00:03"

LENGTH=$2
${JSIDPLAY} --muteVoice2 true --muteVoice3 true --audio WAV --single true --defaultLength "${LENGTH}" --recordingFilename "$1-v1.wav" "$1"
${JSIDPLAY} --muteVoice1 true --muteVoice3 true --audio WAV --single true --defaultLength "${LENGTH}" --recordingFilename "$1-v2.wav" "$1"
${JSIDPLAY} --muteVoice1 true --muteVoice2 true --audio WAV --single true --defaultLength "${LENGTH}" --recordingFilename "$1-v3.wav" "$1"
