import { readFile, writeFile } from 'node:fs/promises'

export interface Config {
  matchType: MatchType
  backgroundDetectionType: BackgroundDetectionType
  charSetType: CharsetType
  allowedChars: number[]
  overwrite: boolean
}

export interface CliOptions {
  background: BackgroundDetectionType
  method: MatchType
  charset: CharsetType
  loadConfig: string
  saveConfig: string
  overwrite: boolean
}

export enum MatchType {
  slow = 'slow',
  fast = 'fast'
}

export enum BackgroundDetectionType {
  optimal = 'optimal',
  firstPixel = 'firstPixel'
}

export enum CharsetType {
  uppercase = 'uppercase',
  lowercase = 'lowercase'
}

const allChars: number[] = Array(255)
  .fill(0)
  .map((_c, i) => i)

export const defaultConfig: Config = {
  matchType: MatchType.slow,
  backgroundDetectionType: BackgroundDetectionType.optimal,
  charSetType: CharsetType.uppercase,
  allowedChars: allChars,
  overwrite: false
}

export function fromCliOptions (options: CliOptions) {
  const result = defaultConfig
  result.backgroundDetectionType = options.background
  result.matchType = options.method
  result.charSetType = options.charset
  result.overwrite = options.overwrite
  return result
}

export async function saveConfig (config: Config, filename: string): Promise<void> {
  await writeFile(filename, JSON.stringify(config))
}

export async function loadConfig (filename: string): Promise<Config> {
  const buf: Buffer = await readFile(filename)
  return JSON.parse(buf.toString())
}
