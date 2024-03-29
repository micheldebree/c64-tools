#!/bin/bash
set -e
SID=$1
LENGTH=$2
. ./jsidplay.inc.sh

if [ -z "${SID}" ]; then
  echo "SID file to WAV"
  echo "USAGE: $0 <SID file> [length]"
  exit 0
fi
${JSIDPLAY} -a WAV "$1"
