#!/bin/sh
sox  "$1" "$1-edit.wav" trim 00:00.10 -0 norm -0.1
