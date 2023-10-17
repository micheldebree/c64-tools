import sharp, { OutputInfo, Sharp } from 'sharp'
import { palette } from './quantizer.js'
import { bytesPerChar, Char } from './charset.js'

export type Byte = number
export type PixelColor = Byte[] // TODO: make r, g, b
export type Tile = PixelColor[][] // 8 x 8 pixels

export interface SharpImage {
  data: Buffer
  info: OutputInfo
}

const mask: Byte[] = [0b10000000, 0b01000000, 0b00100000, 0b00010000, 0b00001000, 0b00000100, 0b00000010, 0b00000001]

// array of offsets for each Char in charData
export function charOffsets(charData: Byte[]): number[] {
  return Array(charData.length / bytesPerChar)
    .fill(0)
    .map((_v, i: number) => i * bytesPerChar)
}

// the number of bits set to 1 in a Byte
export function countBits(b: Byte): number {
  return mask.filter((m: number): boolean => (b & m) !== 0).length
}

// convert a Byte to 8 pixels. bit 1 will be color, bit 0 will be background color
export function byte2Pixels(b: Byte, color: number, backgroundColor: number): PixelColor[] {
  return mask.map((m: number): Byte[] => ((b & m) !== 0 ? palette[color] : palette[backgroundColor]))
}

// hamming distance between two bytes (= number of bits that are the same)
export function hamming(b1: Byte, b2: Byte): number {
  return countBits(b1 ^ b2)
}

// euclidian distance between color channels
// pixels are arrays of 3 number (r, g ,b)
export function distance(p1: PixelColor, p2: PixelColor): number {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2)
}

// return average of all channels of an [r, g, b] PixelColor
export function pixelLuminance(p: PixelColor): number {
  return (p[0] + p[1] + p[2]) / 3
}

export function imageCoordinatesToByteOffset(img: SharpImage, x: number, y: number): number {
  // assume 1 Byte per channel
  return (y * img.info.width + x) * img.info.channels
}

// return an array of offsets into SharpImage.data that correspond with the start of each 8x8 cell
export function cellOffsets(img: SharpImage): number[] {
  const cols: number = img.info.width >> 3
  const rows: number = img.info.height >> 3
  return Array(rows)
    .fill(0)
    .map((_v, row) =>
      Array(cols)
        .fill(0)
        .map((_v, col: number) => imageCoordinatesToByteOffset(img, col * 8, row * 8))
    )
    .flat()
}

// parse an 8 palette index row to a hires Byte
export function parseHiresByteFromPixelRow(tileRow: PixelColor[], backgroundColor: PixelColor): Byte {
  return mask
    .filter((_m: number, i: number): boolean => distance(tileRow[i], backgroundColor) > 64)
    .reduce((a: number, v: number) => a | v, 0)
}

// get an 8 PixelColor row as array of pixels from SharpImage.
export function parse8pixelRow(img: SharpImage, offset: number): PixelColor[] {
  const result: PixelColor[] = []
  for (let i: number = 0; i < 8; i++) {
    const firstChannelOffset: number = offset + i * img.info.channels
    result.push([img.data[firstChannelOffset], img.data[firstChannelOffset + 1], img.data[firstChannelOffset + 2]])
  }
  return result
}

// map c64 Byte order to "normal" Byte order
export function mapByteOrder(offset: number, bytesPerRow: number): number {
  const x: number = Math.floor(offset / bytesPerChar) % bytesPerRow
  const y: number = Math.floor(offset / (bytesPerRow * bytesPerChar)) * bytesPerChar + (offset % bytesPerChar)
  return y * bytesPerRow + x
}

// convert a Char (8 bytes) to a colored tile (8 x 8 [r, g, b] pixels)
export function char2Tile(char: Char, color: number, backgroundColor: number): Tile {
  return Array.from(char).map((b: number) => byte2Pixels(b, color, backgroundColor))
}

export async function createImage(width: number, height: number): Promise<SharpImage> {
  const imageSize: number = width * height * 3
  const imageData: Uint8Array = new Uint8Array(imageSize).fill(0, 0, imageSize)

  return sharp(imageData, {
    // because the input does not contain its dimensions or how many channels it has
    // we need to specify it in the constructor options
    raw: {
      width,
      height,
      channels: 3
    }
  }).toBuffer({ resolveWithObject: true })
}

export function toSharp(image: SharpImage): Sharp {
  return sharp(image.data, {
    raw: {
      width: image.info.width,
      height: image.info.height,
      channels: image.info.channels
    }
  })
}

// async function saveChars (chars) {
//   await writeFile('tiles.bin', Uint8Array.from(cells.flat()))
// }
