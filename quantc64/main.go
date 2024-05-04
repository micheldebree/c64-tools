package main

// https://en.wikipedia.org/wiki/Locality-sensitive_hashing
// k means clustering

// https://stackoverflow.com/questions/41099138/k-means-versus-lsh-algorithm
// https://terenceshin.medium.com/top-five-clustering-algorithms-you-should-know-instead-of-k-means-clustering-b22f25e5bfb4

// https://stackoverflow.com/questions/37271413/heuristics-to-sort-array-of-2d-3d-points-according-their-mutual-distance/37308369#37308369
import (
	"flag"
	"fmt"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
)

type Options struct {
	OutFile        string
	Mode           string
	DitherMode     string
	DitherStrenght int8
}

func main() {

	var options Options

	flag.StringVar(&options.OutFile, "o", "out.png", "output filename")
	flag.StringVar(&options.OutFile, "out", "out.png", "output filename")
	flag.StringVar(&options.Mode, "m", "koala", "graphics mode")
	flag.StringVar(&options.Mode, "mode", "koala", "graphics mode")
	flag.Parse()

	args := flag.Args()

	if len(args) != 1 {
		fmt.Print("filename is mandatory")
		return
	}

	spec, isPresent := C64Specs[options.Mode]
	if !isPresent {
		fmt.Printf("Unknown mode: %s", options.Mode)
		return
	}

	infile := args[0]
	img, err := ReadImageFile(infile)
	if err != nil {
		fmt.Print(err)
		return
	}
	img = Resize(&img, spec.width, spec.height)

	indexedImage := toIndexedImage(&img, spec)
	OrderedDither(&indexedImage, bayer4x4, 0.1)
	newImage := Quantize(indexedImage)

	result := newImage.Render()
	WriteImage(options.OutFile, result)
	fmt.Print(options.OutFile)

}
