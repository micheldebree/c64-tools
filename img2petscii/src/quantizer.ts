import { distance, PixelColor, SharpImage } from './graphics.js'

// colodore
export const palette: PixelColor[] = [
  [0, 0, 0, 0xff], // black
  [0xff, 0xff, 0xff, 0xff], // white
  [0x81, 0x33, 0x38, 0xff], // red
  [0x75, 0xce, 0xc8, 0xff], // cyan
  [0x8e, 0x3c, 0x97, 0xff], // purple
  [0x56, 0xac, 0x4d, 0xff], // green
  [0x2e, 0x2c, 0x9b, 0xff], // blue
  [0xed, 0xf0, 0x71, 0xff], // yellow
  [0x8e, 0x50, 0x29, 0xff], // orange
  [0x55, 0x38, 0x00, 0xff], // brown
  [0xc4, 0x6c, 0x71, 0xff], // light red
  [0x4a, 0x4a, 0x4a, 0xff], // dark gray
  [0x7b, 0x7b, 0x7b, 0xff], // medium gray
  [0xa9, 0xff, 0x9f, 0xff], // light green
  [0x70, 0x6e, 0xeb, 0xff], // light blue
  [0xb2, 0xb2, 0xb2, 0xff] // light gray
]

// map an [r, g, b] color to the index of the closest color in the palette
export function quantize2index(color: PixelColor): number {
  return palette
    .map((paletteColor: PixelColor, i: number) => [i, distance(color, paletteColor)])
    .reduce((acc: number[], current: number[]): number[] => (current[1] < acc[1] ? current : acc), [0, Number.POSITIVE_INFINITY])[0]
}

// unflatten image data by converting it to an array of 320x200 pixels of type
// [r, g, b]
function unflatten(img: SharpImage): PixelColor[] {
  let i: number = 0
  const result: PixelColor[] = []
  while (i < img.data.length) {
    // assume 3 channels
    result.push([img.data[i], img.data[i + 1], img.data[i + 2]])
    i += 3
  }
  return result
}

// return an index image (320 x 200 palette indices) from a raw sharp image
export function quantize(img: SharpImage): number[] {
  return unflatten(img).map((p: PixelColor) => quantize2index(p))
}
