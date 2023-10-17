import { Screen, ScreenCell } from './model.js'

const cols = 40
const rows = 25

export interface FrameBuf {
  width: number
  height: number
  backgroundColor: number
  borderColor: number
  charset: string
  name: string
  framebuf: ScreenCell[][]
  customFonts: object
}

export interface Petmate {
  version: number
  screens: number[]
  framebufs: FrameBuf[]
}

export function fromJSON(json: string): Petmate {
  const content: Petmate = <Petmate>JSON.parse(json)

  if (content.version !== 2) {
    throw new Error(`Unsupported Petmate version: ${content.version}`)
  }
  return content
}

function toFramebuf(screen: Screen, charset: string = 'upper'): FrameBuf {
  const { backgroundColor, cells } = screen

  const framebuf: ScreenCell[][] = []
  for (let y: number = 0; y < rows; y++) {
    const row: ScreenCell[] = []
    for (let x: number = 0; x < cols; x++) {
      row.push(cells[y * cols + x])
    }
    framebuf.push(row)
  }
  return {
    width: cols,
    height: rows,
    backgroundColor,
    borderColor: 0,
    charset,
    name: screen.id,
    framebuf,
    customFonts: {}
  }
}

export function toPetmate(screens: Screen[], charset: string = 'upper'): Petmate {
  const framebufs: FrameBuf[] = screens.map((screen: Screen) => toFramebuf(screen, charset))
  const screenNumbers: number[] = Array.from(Array(screens.length).keys())
  return {
    version: 2,
    screens: screenNumbers,
    framebufs
  }
}
