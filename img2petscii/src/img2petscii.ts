import {
  cellOffsets,
  char2Tile,
  distance,
  imageCoordinatesToByteOffset,
  parse8pixelRow,
  PixelColor,
  SharpImage,
  Tile
} from './graphics.js'
import { quantize, quantize2index } from './quantizer.js'
import { Screen, ScreenCell } from './model.js'
import { BackgroundDetectionType, Config, MatchType } from './config.js'
import { CharSet } from './charset.js'

interface WeightedScreenCell {
  cell: ScreenCell
  distance: number
}

export type MatchFunction = (tile: Tile, chars: CharSet, backgroundColor: number, config: Config) => ScreenCell

export const supportedExtensions: string[] = ['.png', '.jpg', '.webp']

function mostOccurringColorIndex(pixels: number[]): number {
  const counts: number[] = Array(16).fill(0)
  pixels.forEach((p: number) => counts[p]++)
  return counts
    .map((c: number, i: number) => [i, c])
    .reduce((a: number[], v: number[]): number[] => (v[1] > a[1] ? v : a), [0, 0])[0]
}

function bestBackgroundColor(img: SharpImage): number {
  return mostOccurringColorIndex(quantize(img))
}

function bestCell(allDistances: WeightedScreenCell[]): ScreenCell {
  const winner: WeightedScreenCell = allDistances.reduce(
    (a: WeightedScreenCell, v: WeightedScreenCell): WeightedScreenCell => (v.distance < a.distance ? v : a),
    {
      cell: {
        code: 0,
        color: 0
      },
      distance: Number.MAX_VALUE
    }
  )

  return winner.cell
}

// sum of all distances between corresponding pixels in both rows
function tileRowDistance(row1: PixelColor[], row2: PixelColor[]): number {
  return row1.map((p: PixelColor, i: number) => distance(p, row2[i])).reduce((a: number, v: number) => a + v, 0)
}

// calculate the total color distance between each pixel in both tiles
function tileDistance(t1: Tile, t2: Tile): number {
  return t1.map((row: PixelColor[], i: number) => tileRowDistance(row, t2[i])).reduce((a: number, v: number) => a + v, 0)
}

export function bestMatch(tile: Tile, chars: CharSet, backgroundColor: number, config: Config): ScreenCell {
  let finalDistances: WeightedScreenCell[] = []

  Array(16)
    .fill(0)
    .filter((_v, i: number): boolean => i !== backgroundColor)
    .forEach((_v, bestColor: number): void => {
      const distances: WeightedScreenCell[] = config.allowedChars.map((charIndex: number) => {
        const charTile: Tile = char2Tile(chars[charIndex], bestColor, backgroundColor)
        const cell: ScreenCell = { code: charIndex, color: bestColor }
        return { cell, distance: tileDistance(tile, charTile) }
      })
      finalDistances = [...finalDistances, ...distances]
    })
  return bestCell(finalDistances)
}

export function bestFastMatch(tile: Tile, chars: CharSet, backgroundColor: number, config: Config): ScreenCell {
  const bestColor: number = bestColorMatchForTile(tile, backgroundColor)
  const distances: WeightedScreenCell[] = config.allowedChars.map((charIndex: number) => {
    const charTile: Tile = char2Tile(chars[charIndex], bestColor, backgroundColor)
    const cell: ScreenCell = { code: charIndex, color: bestColor }
    return { cell, distance: tileDistance(tile, charTile) }
  })
  return bestCell(distances)
}

function quantizeTile(tile: Tile): number[] {
  return tile.flatMap((row: PixelColor[]) => row.map((p: PixelColor) => quantize2index(p)))
}

// get the most occurring color for the tile, excluding background color
function bestColorMatchForTile(tile: Tile, backgroundColor: number): number {
  return mostOccurringColorIndex(quantizeTile(tile).filter((c: number): boolean => c !== backgroundColor))
}

// cut SharpImage in 8x8 PixelColor tiles, this is a three-dimensional array:
// 8 rows of 8 pixels of [r, g, b]
function cutIntoTiles(img: SharpImage): Tile[] {
  return cellOffsets(img).map((offset: number) =>
    Array(8)
      .fill(0)
      .map((_v, y: number) => offset + imageCoordinatesToByteOffset(img, 0, y))
      .map((rowOffset: number) => parse8pixelRow(img, rowOffset))
  )
}

// convert an image  to a 40x25 array of screen codes
export async function convertImage(
  image: SharpImage,
  charSet: CharSet,
  firstPixelColor: number,
  id: string,
  config: Config
): Promise<Screen> {
  const matcher: MatchFunction = config.matchType === MatchType.fast ? bestFastMatch : bestMatch
  const backgroundColor: number =
    config.backgroundDetectionType === BackgroundDetectionType.firstPixel ? firstPixelColor : bestBackgroundColor(image)
  const cells: ScreenCell[] = cutIntoTiles(image).map((t: Tile) => matcher(t, charSet, backgroundColor, config))
  return { id, backgroundColor, cells }
}

// get the overall background color from one file, by just getting the first
// (quantized) pixel
export async function getBackgroundColor(image: SharpImage): Promise<number> {
  return quantize(image)[0]
}
