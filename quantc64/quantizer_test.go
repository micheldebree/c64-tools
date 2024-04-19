package main
//
// import (
// 	"fmt"
// 	"image/color"
// 	"testing"
// )
//
// func TestDistances(t *testing.T) {
//
// 	palette := color.Palette{
// 		color.RGBA{0x00, 0x00, 0x00, 0xff},
// 		color.RGBA{0xff, 0xff, 0xff, 0xff},
// 		color.RGBA{0xdb, 0x3a, 0x45, 0xff},
// 	}
//
// 	pixel := color.RGBA{0x00, 0x00, 0x00, 0x00}
//
// 	distances := Distances(pixel, palette)
//
// 	fmt.Print(distances)
//
// 	if len(distances) != len(palette) {
// 		t.Error("Wrong array length")
// 	}
//
// }
//
// func TestCompareToLibrary(t *testing.T) {
// 	testPixel(t, color.RGBA{0x80, 0x80, 0x80, 0xff})
// 	testPixel(t, color.RGBA{0x40, 0x40, 0x40, 0xff})
// 	testPixel(t, color.RGBA{0xc0, 0xc0, 0xc0, 0xff})
// 	testPixel(t, color.RGBA{0xc0, 0x80, 0x40, 0xff})
// }
//
// func testPixel(t *testing.T, pixel color.RGBA) {
// 	ourIndex, _ := QuantizeToIndex(pixel, Colodore)
// 	libIndex := Colodore.Index(pixel)
//
// 	fmt.Printf("ours: %d, lib: %d\n", ourIndex, libIndex)
// 	fmt.Print(pixel, Colodore[ourIndex], Colodore[libIndex], "\n\n")
//
// 	if ourIndex != libIndex {
// 		fmt.Println(Distances(pixel, Colodore))
// 		t.Error(fmt.Sprintf("Our index %d does not match lib index %d", ourIndex, libIndex))
// 	}
//
// }
//
// func TestBestIndex(t *testing.T) {
// 	for i := range 16 {
// 		testIndex(t, i)
// 	}
// }
//
// func testIndex(t *testing.T, index int) {
// 	pixel := Colodore[index].(color.RGBA)
// 	distances := Distances(pixel, Colodore)
// 	bestIndex, _ := BestPixelIndex(distances)
// 	if bestIndex != index {
// 		t.Error("Wrong best index")
// 	}
// 	fmt.Println("Color ok")
// }
