import { writeFile } from 'node:fs/promises'

export interface Config {
  matchType: MatchType
  backgroundDetectionType: BackgroundDetectionType
  allowedChars: number[]
}

export enum MatchType {
  slow = 'slow',
  fast = 'fast'
}

export enum BackgroundDetectionType {
  optimal = 'optimal',
  firstPixel = 'firstPixel'
}
const allChars: number[] = Array(255)
  .fill(0)
  .map((_c, i) => i)
export const defaultConfig: Config = {
  matchType: MatchType.slow,
  backgroundDetectionType: BackgroundDetectionType.optimal,
  allowedChars: allChars
}

export async function saveConfig (config: Config, filename: string): Promise<void> {
  await writeFile(filename, JSON.stringify(config))
}
