package main

import (
	"fmt"
	"math"
	"sort"

	"github.com/lucasb-eyer/go-colorful"
	"golang.org/x/exp/maps"
)

// PaletteDistance The distance from an RGB pixel to each key in a Palette
// In the order of the palette
type PaletteDistance map[int]float64

// Maps a palette index to an attribute (bitpattern)
type BitPatterns struct {
	indexToPattern map[int]int
	palette        Palette
}

type Layer struct {
	cellWidth, cellHeight int
	bitpatterns           []int8
	isLast                bool // the last layer should quantize all remaining pixels
}

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

func quantizeCells(cells []IndexedImage, spec Retrospec, layer Layer) []IndexedImage {
	result := make([]IndexedImage, len(cells))
	for ci, cell := range cells {
		result[ci] = quantize(cell, spec, layer)
	}
	return result
}

// TODO: spec is already in img
func quantize(img IndexedImage, spec Retrospec, layer Layer) IndexedImage {
	// newPalette := reducePaletteKmeans(img, maxColors)
	// TODO: assign bitpatterns in reducePalette
	newPalette := reducePalette(img, layer)

	newPixels := make([]Pixel, len(img.pixels))

	// paletteIndexToBitPattern := assignBitPatterns(layer, newPalette)

	var count int
	for pi, pixel := range img.pixels {
		var newPixel Pixel
		// pixels that are already assigned a bitpattern should not
		// be quantized as their color will not be in the reduced palette
		if pixel.hasBitPattern() { // has already been processed
			newPixel = pixel
		} else if layer.isLast { // last layer, all pixels should be quantized against new palette
			newPixel = QuantizePixel(pixel, newPalette)
			newPixel.bitPattern = 0x11
		} else { // not the last layer, only process pixels with a bitpattern in the new palette
			newPixel = QuantizePixel(pixel, spec.palette)
			_, present := newPalette[newPixel.paletteIndex]
			if present {
				newPixel.bitPattern = 0x11
			} 
		}
		newPixels[pi] = newPixel
		count++
	}
	// fmt.Printf("%d pixels have been assigned a bit pattern\n", count)

	// newSpec := Retrospec{spec.width, spec.height, spec.pixelWidth, newPalette}
	return IndexedImage{spec, newPixels}
}

// assign a bit pattern to each entry in the palette
// map paletteindex -> bit pattern
func assignBitPatterns(layer Layer, palette Palette) map[int]int8 {

	if len(layer.bitpatterns) < len(palette) {
		panic(fmt.Sprintf("Not enough bit patterns (%d) for palette of length (%d)", len(layer.bitpatterns), len(palette)))
	}

	result := make(map[int]int8)

	i := 0
	for k := range palette {
		result[k] = layer.bitpatterns[i]
		i++
	}
	return result
}

// reduce a palette to maximum number of colors according to their
// quantized occurence in pixels
func reducePalette(img IndexedImage, layer Layer) Palette {

	indexToCount := make(map[int]int)

	// count nr of pixels for each quantized color
	for _, pixel := range img.pixels {

		// pixels that are already assigned a bitpattern don't count
		if !pixel.hasBitPattern() {
			pixel = QuantizePixel(pixel, img.spec.palette)
			indexToCount[pixel.paletteIndex] += 1
		}
	}

	// sort in reverse order of count values
	keys := maps.Keys(indexToCount)
	sort.SliceStable(keys, func(i, j int) bool {
		return indexToCount[keys[i]] > indexToCount[keys[j]]
	})

	maxColors := len(layer.bitpatterns)
	if maxColors < len(keys) {
		keys = keys[0:maxColors]
	}

	result := make(Palette)

	for _, key := range keys {
		result[key] = img.spec.palette[key]
	}
	return result
}
