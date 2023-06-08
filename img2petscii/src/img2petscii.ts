import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { toFilenames, relativePath } from './utils.js'
import { Petmate } from './petmate.js'
import {
  readChars,
  parse8pixelRow,
  imageCoordinatesToByteOffset,
  cellOffsets,
  byte2Pixels,
  distance,
  Byte,
  PixelColor,
  Tile,
  SharpImage,
  Char,
  CharSet
} from './graphics.js'
import { quantize, quantize2index } from './quantizer.js'
import { toPetmate, ScreenCell, Screen } from './petmate.js'
import { Command, Option } from 'commander'

interface WeightedScreenCell {
  cell: ScreenCell
  distance: number
}

interface MatchFunction {
  (tile: Tile, chars: CharSet, backgroundColor: number, config: Config): ScreenCell
}

enum MatchType {
  slow,
  fast
}

enum BackgroundDetectionType {
  optimal,
  firstPixel
}

interface Config {
  matcher: MatchType
  backgroundDetection: BackgroundDetectionType
  allowedChars: number[]
}

const allChars: Byte[] = Array(255)
  .fill(0)
  .map((_c, i) => i)

const defaultConfig: Config = {
  matcher: MatchType.slow,
  backgroundDetection: BackgroundDetectionType.optimal,
  allowedChars: allChars
}

const cols = 40
const rows = 25
const width: number = cols * 8
const height: number = rows * 8
// TODO: case insensitive matching
const supportedExtensions: string[] = ['.png', '.jpg', '.webp']

// load and scale the image
async function loadFile (filename: string): Promise<SharpImage> {
  return await sharp(filename).resize(width, height).removeAlpha().raw().toBuffer({ resolveWithObject: true })
}

// pixels is an array of color indices
function mostOccuringColorIndex (pixels: number[]): number {
  const counts: number[] = Array(16).fill(0)
  pixels.forEach(p => counts[p]++)
  return counts.map((c, i) => [i, c]).reduce((a, v) => (v[1] > a[1] ? v : a), [0, 0])[0]
}

function bestBackgroundColor (img: SharpImage): number {
  return mostOccuringColorIndex(quantize(img))
}

// convert a Char (8 bytes) to a colored tile (8 x 8 [r, g, b] pixels)
function char2Tile (char: Char, color: number, backgroundColor: number): Tile {
  return Array.from(char).map(b => byte2Pixels(b, color, backgroundColor))
}

function bestCell (allDistances: WeightedScreenCell[]) {
  const winner: WeightedScreenCell = allDistances.reduce((a, v) => (v.distance < a.distance ? v : a), {
    cell: {
      code: 0,
      color: 0
    },
    distance: Number.MAX_VALUE
  })

  return winner.cell
}

// sum of all distances between corresponding pixels in both rows
function tileRowDistance (row1: PixelColor[], row2: PixelColor[]): number {
  return row1.map((p, i) => distance(p, row2[i])).reduce((a, v) => a + v, 0)
}

// calculate the total color distance between each pixel in both tiles
function tileDistance (t1: Tile, t2: Tile): number {
  return t1.map((row, i) => tileRowDistance(row, t2[i])).reduce((a, v) => a + v, 0)
}

function bestMatch (tile: Tile, chars: CharSet, backgroundColor: number, config: Config): ScreenCell {
  let finalDistances: WeightedScreenCell[] = []

  Array(16)
    .fill(0)
    .filter((_v, i) => i !== backgroundColor)
    .forEach((_v, bestColor) => {
      const distances: WeightedScreenCell[] = config.allowedChars.map(charIndex => {
        const charTile = char2Tile(chars[charIndex], bestColor, backgroundColor)
        const cell: ScreenCell = { code: charIndex, color: bestColor }
        return { cell, distance: tileDistance(tile, charTile) }
      })
      finalDistances = [...finalDistances, ...distances]
    })
  return bestCell(finalDistances)
}

function bestFastMatch (tile: Tile, chars: CharSet, backgroundColor: number, config: Config): ScreenCell {
  const bestColor: number = bestColorMatchForTile(tile, backgroundColor)
  const distances: WeightedScreenCell[] = config.allowedChars.map(charIndex => {
    const charTile = char2Tile(chars[charIndex], bestColor, backgroundColor)
    const cell: ScreenCell = { code: charIndex, color: bestColor }
    return { cell, distance: tileDistance(tile, charTile) }
  })
  return bestCell(distances)
}

function quantizeTile (tile: Tile): number[] {
  return tile.flatMap(row => row.map(p => quantize2index(p)))
}

// get the most occuring color for the tile, excluding background color
function bestColorMatchForTile (tile: Tile, backgroundColor: number): number {
  return mostOccuringColorIndex(quantizeTile(tile).filter(c => c !== backgroundColor))
}

// cut SharpImage in 8x8 PixelColor tiles, this is a three dimensional array:
// 8 rows of 8 pixels of [r, g, b]
function cutIntoTiles (img: SharpImage): Tile[] {
  return cellOffsets(img).map(offset =>
    Array(8)
      .fill(0)
      .map((_v, y) => offset + imageCoordinatesToByteOffset(img, 0, y))
      .map(rowOffset => parse8pixelRow(img, rowOffset))
  )
}

// convert an image file to a 40x25 array of screencodes
async function convertFile (filename: string, charSet: CharSet, firstPixelColor: number, config: Config): Promise<Screen> {
  const image: SharpImage = await loadFile(filename)
  const matcher: MatchFunction = config.matcher === MatchType.fast ? bestFastMatch : bestMatch
  const backgroundColor =
    config.backgroundDetection === BackgroundDetectionType.firstPixel ? firstPixelColor : bestBackgroundColor(image)
  console.log(`Input: ${filename}`)
  const cells: ScreenCell[] = cutIntoTiles(image).map(t => matcher(t, charSet, backgroundColor, config))
  return { backgroundColor, cells }
}

// get the overall background color from one file, by just getting the first
// (quantized) pixel
async function getBackgroundColor (filename: string): Promise<number> {
  const image: SharpImage = await loadFile(filename)
  return quantize(image)[0]
}

(async function () {
  const cli = new Command()

  const optionBackground = new Option('-b, --background <method>', 'method for choosing background color')
    .choices(['optimal', 'firstPixel'])
    .default('optimal')

  const optionMethod = new Option('-m, --method <method>', 'method for matching PETSCII characters')
    .choices(['slow', 'fast'])
    .default('slow')

  cli
    .version('0.0.0')
    .description('Convert images to PETSCII')
    .usage('[options] <image file|folder>')
    .addOption(optionMethod)
    .addOption(optionBackground)
    .parse(process.argv)

  const options = cli.opts()

  const inputName: string = cli.args[0]

  if (inputName === undefined) {
    cli.help()
    process.exit(1)
  }

  const config = defaultConfig
  config.backgroundDetection = options.background
  config.matcher = options.method

  // console.log(config)

  // TODO: check for flle override

  try {
    const outputName = `${inputName}.petmate`
    const filenames: string[] = await toFilenames(inputName, supportedExtensions)
    const charSet: CharSet = await readChars(relativePath('./characters.901225-01.bin'))
    const backgroundColor = await getBackgroundColor(filenames[0])
    const screens: Screen[] = await Promise.all(filenames.map(async f => await convertFile(f, charSet, backgroundColor, config)))
    const petmate: Petmate = toPetmate(screens)
    await writeFile(outputName, JSON.stringify(petmate))
    console.log(`Output: ${outputName}`)
  } catch (err) {
    console.log(`\nERROR: ${err.message}.\n`)
    cli.help()
    process.exit(1)
  }
})()
