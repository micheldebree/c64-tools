package main

import (
	"fmt"
	"image"
)

// IndexedImage an image with pixels in left to right, top to bottom order
type IndexedImage struct {
	spec   Retrospec
	pixels []Pixel
}

type Retrospec struct {
	width      int
	height     int
	pixelWidth int
	palette    Palette
}

func (spec Retrospec) displayWidth() int {
	return spec.width * spec.pixelWidth
}

func (spec Retrospec) displayHeight() int {
	return spec.height
}

var MCBitmap = Retrospec{160, 200, 2, Colodore}
var HiresBitmap = Retrospec{320, 200, 1, Colodore}

func newIndexedImage(spec Retrospec) IndexedImage {
	pixels := make([]Pixel, spec.width*spec.height)
	return IndexedImage{spec, pixels}
}

func toIndexedImage(img *image.Image, spec Retrospec) IndexedImage {
	pixels := getPixels(img)
	return IndexedImage{spec, pixels}
}

func (img *IndexedImage) PixelAt(x, y int) Pixel {
	return img.pixels[y*img.spec.width+x]
}

func (img *IndexedImage) SetPixel(pixel Pixel) {
	img.pixels[pixel.y*img.spec.width+pixel.x] = pixel
}

// Assign a bit pattern to all the pixels which are quantized to a certain palette index
func (img *IndexedImage) assignBitPattern(index int, bitPattern int8) IndexedImage {

	result := newIndexedImage(img.spec)

	for _, pixel := range img.pixels {

		if pixel.hasBitPattern() {
			panic(fmt.Sprintf("Pixel %v already has bit pattern assigned", pixel))
		}

		newPixel := QuantizePixel(pixel, img.spec.palette)

		if newPixel.paletteIndex == index {
			newPixel.bitPattern = bitPattern
		}

		result.SetPixel(newPixel)

	}
	return result
}

func combine(cells *[]IndexedImage, spec Retrospec) IndexedImage {
	result := newIndexedImage(spec)

	for _, c := range *cells {
		for _, p := range c.pixels {
			result.SetPixel(p)
		}
	}
	return result
}

// Render to a 'normal' RGBA image
func (img *IndexedImage) Render() image.Image {
	result := image.NewRGBA(image.Rectangle{
		Min: image.Point{},
		Max: image.Point{X: img.spec.displayWidth(), Y: img.spec.displayHeight()},
	})
	for y := range img.spec.height {
		for x := range img.spec.width {
			pixel := img.PixelAt(x, y)
			for xx := range img.spec.pixelWidth {
				result.SetRGBA(x*img.spec.pixelWidth+xx, y, toColor(pixel.getColor(img.spec.palette)))
			}
		}
	}
	return result
}
