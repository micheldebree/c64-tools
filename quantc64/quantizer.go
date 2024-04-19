package main

import (
	"math"
	"sort"

	"github.com/lucasb-eyer/go-colorful"
	"golang.org/x/exp/maps"
)

// PaletteDistance The distance from an RGB pixel to each key in a Palette
// In the order of the palette
type PaletteDistance map[int]float64

func distance(color1, color2 colorful.Color) float64 {
	return color1.DistanceRgb(color2)
	// return color1.DistanceCIE94(color2)
}

// Distances Distance from a pixel to each color in a palette
func Distances(aColor colorful.Color, palette Palette) PaletteDistance {
	result := make(PaletteDistance, len(palette))
	for palIndex, c := range palette {
		result[palIndex] = distance(aColor, c)
	}
	return result
}

// The palette index with the smallest distance
// also returns the distance itself, meaning the quantization error
// which is useful for error diffusion dithering
func BestPixelIndex(distances PaletteDistance) (index int, qerror float64) {
	bestIndex := -1
	smallestDistance := math.MaxFloat64
	for i, distance := range distances {
		if distance < smallestDistance {
			smallestDistance = distance
			bestIndex = i
		}
	}

	if bestIndex < 0 {
		panic("Could not determine best index")
	}

	return bestIndex, smallestDistance
}

func QuantizePixel(p Pixel, pal Palette) Pixel {

	c := p.color
	i, qerror := QuantizeToIndex(c, pal)

	p.paletteIndex = i
	p.quantizationError = qerror
	return p
}

func QuantizeToIndex(aColor colorful.Color, palette Palette) (int, float64) {
	return BestPixelIndex(Distances(aColor, palette))
}

func quantizeCells(cells []IndexedImage, spec Retrospec, maxColors int) []IndexedImage {
	result := make([]IndexedImage, len(cells))
	for ci, cell := range cells {
		result[ci] = quantize(cell, spec, maxColors)
	}
	return result
}

func quantize(img IndexedImage, spec Retrospec, maxColors int) IndexedImage {
	// pal := reducePaletteKmeans(img, maxColors)
	pal := reducePalette(img, maxColors)
	newPixels := make([]Pixel, len(img.pixels))
	for pi, pixel := range img.pixels {
		// pixels that are already assigned a bitpattern don't count
		if pixel.hasBitPattern() {
			newPixels[pi] = pixel
		} else {
			newPixels[pi] = QuantizePixel(pixel, pal)
		}
	}
	return IndexedImage{spec, newPixels}
}

// reduce a palette to maximum number of colors according to their
// quantized occurence in pixels
func reducePalette(img IndexedImage, maxColors int) Palette {

	indexToCount := make(map[int]int)

	// count nr of pixels for each quantized color
	for _, pixel := range img.pixels {
		pixel = QuantizePixel(pixel, img.spec.palette)

		// pixels that are already assigned a bitpattern don't count
		if !pixel.hasBitPattern() {
			indexToCount[pixel.paletteIndex] += 1
		}
	}

	// sort in reverse order of count values
	keys := maps.Keys(indexToCount)
	sort.SliceStable(keys, func(i, j int) bool {
		return indexToCount[keys[i]] > indexToCount[keys[j]]
	})

	if maxColors < len(keys) {
		keys = keys[0:maxColors]
	}

	result := make(Palette)
	for _, key := range keys {
		result[key] = img.spec.palette[key]
	}
	return result
}
