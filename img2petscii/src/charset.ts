import { Byte } from './graphics.js'
import { readFile } from 'node:fs/promises'
import { relativePath } from './utils.js'

export const bytesPerChar: number = 8
export type CharSet = Char[]

export type Char = Byte[] // 8 bytes

const romCharSetFile: string = './characters.901225-01.bin'

function charOffsets(charData: Byte[]): number[] {
  return Array(charData.length / bytesPerChar)
    .fill(0)
    .map((_v, i: number) => i * bytesPerChar)
}

// callback (index, array of 8 bytes)
export function forEachCharIn(charData: Byte[], callback: (index: number, charData: Byte[]) => void): void {
  charOffsets(charData).forEach((offset: number, i: number): void => callback(i, charData.slice(offset, offset + bytesPerChar)))
}

// read 256 characters from a binary character set
export async function readChars(filename: string, offset: number = 0): Promise<CharSet> {
  const buffer: Buffer = await readFile(filename)
  const charData: Byte[] = Array.from(buffer).slice(offset * 8, (offset + 256) * 8)
  const chars: CharSet = []
  forEachCharIn(charData, (_i: number, charBytes: Byte[]) => chars.push(charBytes))
  return chars
}

export async function readRomCharSet(lowercase: boolean = false): Promise<CharSet> {
  return await readChars(relativePath(romCharSetFile), lowercase ? 256 : 0)
}
