import { readFile, writeFile } from 'node:fs/promises'
import { ROMCharsetType } from './charset.js'

export interface Config {
  matchType: MatchType
  backgroundDetectionType: BackgroundDetectionType
  charSetType: ROMCharsetType
  allowedChars: number[]
  overwrite: boolean
  mono: boolean
  threshold: number
  format: FormatType
}

export interface CliOptions {
  background: BackgroundDetectionType
  method: MatchType
  charset: ROMCharsetType
  loadConfig: string
  saveConfig: string
  overwrite: boolean
  mono: boolean
  threshold: string
  format: FormatType
  output: string
}

export enum MatchType {
  slow = 'slow',
  fast = 'fast'
}

export enum BackgroundDetectionType {
  optimal = 'optimal',
  firstPixel = 'firstPixel'
}

export enum FormatType {
  petmate = 'petmate',
  png = 'png'
}

const allChars: number[] = Array(255)
  .fill(0)
  .map((_c, i: number) => i)

export const defaultConfig: Config = {
  matchType: MatchType.slow,
  backgroundDetectionType: BackgroundDetectionType.optimal,
  charSetType: ROMCharsetType.uppercase,
  allowedChars: allChars,
  overwrite: false,
  mono: false,
  threshold: 128,
  format: FormatType.petmate
}

export function fromCliOptions(options: CliOptions): Config {
  const result: Config = defaultConfig
  result.backgroundDetectionType = options.background
  result.matchType = options.method
  result.charSetType = options.charset
  result.overwrite = options.overwrite
  result.mono = options.mono
  result.threshold = parseInt(options.threshold)
  result.format = options.format

  if (result.threshold < 0 || result.threshold > 255) {
    throw new Error('Value for --threshold should be between 0 and 255')
  }

  return result
}

export async function saveConfig(config: Config, filename: string): Promise<void> {
  await writeFile(filename, JSON.stringify(config))
}

export async function loadConfig(filename: string): Promise<Config> {
  const buf: Buffer = await readFile(filename)
  return <Config>JSON.parse(buf.toString())
}
