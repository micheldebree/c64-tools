#!/bin/bash
set -e
. ./jsidplay.inc.sh
SID=$1
LENGTH=$2
if [ -z "${SID}" ]; then
  echo "SID file to WAV"
  echo "USAGE: $0 <SID file> [length]"
  exit 0
fi
if [ -n "${LENGTH}" ]; then
  LENGTH_PARAM="--defaultLength ${LENGTH}"
fi
# ${JSIDPLAY} --single true -a WAV ${LENGTH_PARAM} "$1"
${JSIDPLAY} -a WAV ${LENGTH_PARAM} "$1"
