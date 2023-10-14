#!/bin/sh
ffmpeg -i "$1" -c:a libmp3lame -qscale:a 2  "$1.mp3"

