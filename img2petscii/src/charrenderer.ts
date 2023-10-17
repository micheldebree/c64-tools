import { byte2Pixels, Char, CharSet, createImage, mapByteOrder, PixelColor, SharpImage, toSharp } from './graphics.js'
import { Sharp } from 'sharp'

export async function renderCharSet(chars: CharSet): Promise<Sharp> {
  const bytesPerRow: number = 32
  const width: number = bytesPerRow * 8
  const height: number = chars.length / 4
  const img: SharpImage = await createImage(width, height)

  chars.forEach((c: Char, ci: number): void => {
    c.forEach((b: number, bi: number): void => {
      const offset: number = ci * 8 + bi

      const pixels: PixelColor[] = byte2Pixels(b, 1, 0)

      const byteOffset: number = mapByteOrder(offset, bytesPerRow)

      pixels.forEach((p: PixelColor, pi: number): void => {
        const bitOffset: number = byteOffset * 8 + pi
        const offset: number = bitOffset * 3

        img.data[offset] = p[0]
        img.data[offset + 1] = p[1]
        img.data[offset + 2] = p[2]
      })
    })
  })

  return toSharp(img)
}
