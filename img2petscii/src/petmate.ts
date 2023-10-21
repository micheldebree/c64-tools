import { Screen, ScreenCell } from './model.js'

const cols: number = 40
const rows: number = 25

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

export enum PetmateCharset {
  uppercase = 'upper',
  lowercase = 'lower'
}

export function fromJSON(json: string): Petmate {
  const content: Petmate = <Petmate>JSON.parse(json)

  if (content.version !== 2) {
    throw new Error(`Unsupported Petmate version: ${content.version}`)
  }
  return content
}

function toFramebuf(screen: Screen, charset: PetmateCharset = PetmateCharset.uppercase): FrameBuf {
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

export function toScreens(petmate: Petmate): Screen[] {
  return petmate.framebufs.map((frame: FrameBuf) => toScreen(frame))
}

export function toScreen(frame: FrameBuf): Screen {
  const id: string = frame.name
  const backgroundColor: number = frame.backgroundColor
  const cells: ScreenCell[] = frame.framebuf.flat()

  return { id, backgroundColor, cells }
}

export function toPetmate(screens: Screen[], charset: PetmateCharset = PetmateCharset.uppercase): Petmate {
  const framebufs: FrameBuf[] = screens.map((screen: Screen) => toFramebuf(screen, charset))
  const screenNumbers: number[] = Array.from(Array(screens.length).keys())
  return {
    version: 2,
    screens: screenNumbers,
    framebufs
  }
}
