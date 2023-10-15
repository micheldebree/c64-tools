#!/bin/bash
set -e
SID=$1
LENGTH=$2

. ./jsidplay.inc.sh

if [ -z "${SID}" ]; then
  echo "Split SID tunes into three separate WAV tracks"
  echo "USAGE: $0 <SID file> [length]"
  exit 0
fi

${JSIDPLAY} --muteVoice2 true --muteVoice3 true --audio WAV --single true "${SID}"
mv "${BASENAME}.wav" "${BASENAME}-track_1.wav"
${JSIDPLAY} --muteVoice1 true --muteVoice3 true --audio WAV --single true "${SID}"
mv "${BASENAME}.wav" "${BASENAME}-track_2.wav"
${JSIDPLAY} --muteVoice1 true --muteVoice2 true --audio WAV --single true "${SID}"
mv "${BASENAME}.wav" "${BASENAME}-track_3.wav"
