package main

// https://en.wikipedia.org/wiki/Locality-sensitive_hashing
// k means clustering

// https://stackoverflow.com/questions/41099138/k-means-versus-lsh-algorithm
// https://terenceshin.medium.com/top-five-clustering-algorithms-you-should-know-instead-of-k-means-clustering-b22f25e5bfb4

import (
	"flag"
	"fmt"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
)

func main() {

	outnamePtr := flag.String("o", "out.png", "output filename")
	flag.Parse()

	args := flag.Args()

	if len(args) != 1 {
		panic("filename is mandatory")
	}

	spec := MCBitmap

	infile := args[0]
	img := ReadImageFile(infile)
	img = Resize(&img, spec.width, spec.height)

	indexedImage := toIndexedImage(&img, spec)
	OrderedDither(&indexedImage, bayer4x4, 0.1)
	newImage := Quantize(indexedImage)

	result := newImage.Render()
	WriteImage(*outnamePtr, result)

	fmt.Printf("%v, %v\n", indexedImage.spec.width, indexedImage.spec.height)

}
