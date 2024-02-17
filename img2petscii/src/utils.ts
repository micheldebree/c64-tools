import { access, lstat, readdir } from 'node:fs/promises'
import fs, { Stats } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

// Return the filename, or return the files in the folder if a folder is supplied
// inputName: name of a file or a folder
// supportedExtensions: array of strings of extensions that are supported
export async function toFilenames(fileOrFolderName: string, supportedExtensions: string[]): Promise<string[]> {
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
      .filter((f: string) => supportedExtensions.includes(path.extname(f).toLowerCase()))
      .sort()
      .map((f: string) => path.join(fileOrFolderName, f))
    if (filtered.length === 0) {
      const extensionsSeparated = supportedExtensions.reduce((p: string, c: string): string => `${p},${c}`)
      throw new Error(`No files of type ${extensionsSeparated} found in ${fileOrFolderName}`)
    }
    return filtered
  }
  throw new Error(`Unsupported file type: ${fileOrFolderName}`)
}

export async function fileExists(filename: string): Promise<boolean> {
  try {
    await access(filename, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

export async function folderExists(folder: string): Promise<boolean> {
  let stats: Stats
  try {
    stats = await lstat(folder)
  } catch {
    return false
  }
  return stats.isDirectory()
}

// get a path relative to this module
export function relativePath(filename: string): string {
  const __filename: string = fileURLToPath(import.meta.url)
  const __dirname: string = path.dirname(__filename)
  return path.join(__dirname, filename)
}

export function filenameWithouthExtension(filename: string): string {
  return path.basename(filename, path.extname(filename))
}

export function changeExtension(filename: string, extension: string): string {
  const currentExtension: string = path.extname(filename)
  if (currentExtension.toLowerCase() === extension.toLowerCase()) {
    throw new Error(`File already has extension ${extension}`)
  }
  return `${path.basename(filename, currentExtension)}.${extension}`
}

// throw an error if the file exists and overwrite is not allowed
async function checkOverwrite(filename: string, mayOverwrite: boolean): Promise<void> {
  if (!mayOverwrite) {
    const exists: boolean = await fileExists(filename)
    if (exists) {
      throw new Error(`Output file ${filename} already exists. Use --overwrite to force overwriting.`)
    }
  }
}

// throw an error if the file is a folder or if it exists already and is not allowed to be overwritten
export async function validateOutputFilename(filename: string, mayOverwrite: boolean): Promise<void> {
  const isFolder: boolean = await folderExists(filename)

  if (isFolder) {
    throw new Error(`Output file ${filename} is an existing directory and cannot be used`)
  }

  await checkOverwrite(filename, mayOverwrite)
}
