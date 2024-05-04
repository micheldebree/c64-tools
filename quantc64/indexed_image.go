package main

import (
	"image"
)

// IndexedImage an image with pixels in left to right, top to bottom order
type IndexedImage struct {
	spec   Retrospec
	pixels []Pixel
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
