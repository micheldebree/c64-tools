import { lstat, readdir, access } from 'node:fs/promises'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { Stats } from 'fs'

// Aap
// Return the filename, or return the files in the folder if a folder is supplied
// inputName: name of a file or a folder
// supportedExtensions: array of strings of extensions that are supported
export async function toFilenames (fileOrFolderName: string, supportedExtensions: string[]): Promise<string[]> {
  let stats: Stats
  try {
    stats = await lstat(fileOrFolderName)
  } catch (err) {
    throw new Error(`Not found: ${fileOrFolderName}`)
  }

  if (stats.isFile() && supportedExtensions.includes(path.extname(fileOrFolderName))) {
    return [fileOrFolderName]
  }
  if (stats.isDirectory()) {
    const filenames: string[] = await readdir(fileOrFolderName)
    const filtered: string[] = filenames
      .filter(f => supportedExtensions.includes(path.extname(f).toLowerCase()))
      .sort()
      .map(f => path.join(fileOrFolderName, f))
    if (filtered.length === 0) {
      throw new Error(`No files of type ${supportedExtensions} found in ${fileOrFolderName}`)
    }
    return filtered
  }
  throw new Error(`Unsupported file type: ${fileOrFolderName}`)
}

export async function fileExists (filename: string): Promise<boolean> {
  try {
    await access(filename, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

// get a path relative to this module
export function relativePath (filename: string): string {
  const __filename: string = fileURLToPath(import.meta.url)
  const __dirname: string = path.dirname(__filename)
  return path.join(__dirname, filename)
}

export function filenameWithouthExtension (filename: string) {
  const extension = path.extname(filename)
  return path.basename(filename, extension)
}
