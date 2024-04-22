package main

import (
	"image"
)

// IndexedImage an image with pixels in left to right, top to bottom order
type IndexedImage struct {
	spec   Retrospec
	pixels []Pixel
}

type Layer struct {
	cellWidth, cellHeight int
	bitpatterns           []int8
	isLast                bool // the last layer should quantize all remaining pixels
}

type Retrospec struct {
	width      int
	height     int
	pixelWidth int
	palette    Palette
	layers     []Layer
}

func (spec Retrospec) displayWidth() int {
	return spec.width * spec.pixelWidth
}

func (spec Retrospec) displayHeight() int {
	return spec.height
}

var MCBitmap = Retrospec{160, 200, 2, Colodore,
	[]Layer{
		{160, 200, []int8{0x00}, false},
		{4, 8, []int8{0x01, 0x10, 0x11}, true},
	},
}
var HiresBitmap = Retrospec{320, 200, 1, Colodore,
	[]Layer{
		{8, 8, []int8{0, 1}, true},
	},
}

var MCChar = Retrospec{160, 200, 2, Colodore,
	[]Layer{
		{160, 200, []int8{0x00, 0x01, 0x10}, false}, // background, d022, d023
		{4, 8, []int8{0x11}, true}, // char color
	},
}

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
