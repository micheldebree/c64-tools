import { SharpImage, CharSet, createImage, toSharp, byte2Pixels, mapByteOrder } from './graphics.js'
import { Sharp } from 'sharp'

export async function renderCharSet (chars: CharSet): Promise<Sharp> {
  const bytesPerRow = 32
  const width = bytesPerRow * 8
  const height = chars.length / 4
  const img: SharpImage = await createImage(width, height)

  chars.forEach((c, ci) => {
    c.forEach((b, bi) => {
      const offset = ci * 8 + bi

      const pixels = byte2Pixels(b, 1, 0)

      const byteOffset = mapByteOrder(offset, bytesPerRow)

      pixels.forEach((p, pi) => {
        const bitOffset = byteOffset * 8 + pi
        const offset = bitOffset * 3

        img.data[offset] = p[0]
        img.data[offset + 1] = p[1]
        img.data[offset + 2] = p[2]
      })
    })
  })

  return toSharp(img)
}
