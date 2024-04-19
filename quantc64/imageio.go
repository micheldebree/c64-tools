package main

import (
	"image"
	"image/png"
	"os"
)

func abortOnError(err error) {
	if err != nil {
		panic(err)
	}
}

// ReadImageFile read an image from a file
func ReadImageFile(filename string) image.Image {

	f, err := os.Open(filename)
	abortOnError(err)
	defer func(f *os.File) {
		err := f.Close()
		abortOnError(err)
	}(f)

	img, _, err := image.Decode(f)
	abortOnError(err)

	return img
}

func WriteImage(filename string, image image.Image) {

	out, err := os.Create(filename)
	abortOnError(err)

	err = png.Encode(out, image)
	abortOnError(err)
}
