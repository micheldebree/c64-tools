import { SharpImage, Tile, createImage, toSharp, char2Tile, PixelColor } from './graphics.js'
import { Sharp } from 'sharp'
import { Char, CharSet } from './charset.js'
import { Screen, ScreenCell } from './model.js'
import { checkOverwrite } from './utils.js'

async function toImage(screen: Screen, charset: CharSet): Promise<Sharp> {
  const bytesPerRow: number = 40
  const width: number = bytesPerRow * 8
  const height: number = 25 * 8
  const img: SharpImage = await createImage(width, height)

  screen.cells.forEach((cell: ScreenCell, ci: number): void => {
    const char: Char = charset[cell.code]
    const tile: Tile = char2Tile(char, cell.color, screen.backgroundColor)

    tile.forEach((row: PixelColor[], ri: number): void => {
      row.forEach((pixel: PixelColor, pi: number): void => {
        const cellX: number = ci % 40
        const cellY: number = Math.floor(ci / 40)

        const pixelX: number = cellX * 8 + pi
        const pixelY: number = cellY * 8 + ri

        const offset: number = (pixelX + pixelY * 320) * 3
        img.data[offset] = pixel[0]
        img.data[offset + 1] = pixel[1]
        img.data[offset + 2] = pixel[2]
      })
    })
  })
  return toSharp(img)
}

async function saveScreen(screen: Screen, charset: CharSet, basename: string, mayOverwrite: boolean): Promise<void> {
  const renderedScreen: Sharp = await toImage(screen, charset)
  const outputName: string = `${basename}-${screen.id}.png`
  await checkOverwrite(outputName, mayOverwrite)
  await renderedScreen.toFile(outputName)
  console.log(`Output: ${outputName}`)
}

export async function saveScreens(screens: Screen[], charset: CharSet, basename: string, mayOverwrite: boolean): Promise<void> {
  await Promise.all(screens.map(async (screen: Screen): Promise<void> => await saveScreen(screen, charset, basename, mayOverwrite)))
}
