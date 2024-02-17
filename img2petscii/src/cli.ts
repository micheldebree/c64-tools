#!/usr/bin/env node
import { Command, Option } from 'commander'
import { writeFile } from 'node:fs/promises'
import path from 'path'
import sharp, { Sharp } from 'sharp'
import { CharSet, ROMCharsetType, readRomCharSet } from './charset.js'
import {
  BackgroundDetectionType,
  CliOptions,
  Config,
  FormatType,
  MatchType,
  fromCliOptions,
  loadConfig,
  saveConfig
} from './config.js'
import { SharpImage } from './graphics.js'
import { convertImage, getBackgroundColor, supportedExtensions } from './img2petscii.js'
import { Screen } from './model.js'
import { Petmate, PetmateCharset, toPetmate } from './petmate.js'
import { saveScreens } from './png.js'
import { changeExtension, filenameWithouthExtension, folderExists, toFilenames, validateOutputFilename } from './utils.js'

// TODO get version from package.json
const version = '0.0.8'
const cols: number = 40
const rows: number = 25
const width: number = cols * 8
const height: number = rows * 8

// load and scale the image
async function loadFile(filename: string, config: Config): Promise<SharpImage> {
  let result: Sharp = sharp(filename)

  result = result.resize(width, height).removeAlpha()
  if (config.mono) {
    result = result.threshold(config.threshold)
  }

  return await result.raw().toBuffer({ resolveWithObject: true })
}

// convert an image file to a 40x25 array of screencodes
async function convertFile(filename: string, charSet: CharSet, firstPixelColor: number, config: Config): Promise<Screen> {
  console.log(`Input: ${filename}`)
  const image: SharpImage = await loadFile(filename, config)
  const frameId: string = filenameWithouthExtension(filename)
  return convertImage(image, charSet, firstPixelColor, frameId, config)
}

async function savePetmate(screens: Screen[], filename: string, config: Config): Promise<void> {
  const petmateCharset: PetmateCharset =
    config.charSetType === ROMCharsetType.lowercase ? PetmateCharset.lowercase : PetmateCharset.uppercase
  const petmate: Petmate = toPetmate(screens, petmateCharset)
  await writeFile(filename, JSON.stringify(petmate))
}

await (async function (): Promise<void> {
  const optionBackground: Option = new Option('-b, --background <method>', 'method for choosing background color')
    .choices([BackgroundDetectionType.optimal, BackgroundDetectionType.firstPixel])
    .default(BackgroundDetectionType.optimal)

  const optionMethod: Option = new Option('-m, --method <method>', 'method for matching PETSCII characters')
    .choices([MatchType.slow, MatchType.fast])
    .default(MatchType.slow)

  const optionCharset: Option = new Option('-c, --charset <name>', 'which ROM character set to use')
    .choices([ROMCharsetType.uppercase, ROMCharsetType.lowercase])
    .default(ROMCharsetType.uppercase)

  const optionThreshold: Option = new Option('--threshold <value>', 'threshold (0-255) for --mono mode').default(128)

  const optionFormat: Option = new Option('-f, --format <name>', 'output format')
    .choices([FormatType.petmate, FormatType.png])
    .default(FormatType.petmate)

  const cli: Command = new Command()
    .version(version)
    .description('Convert images to PETSCII')
    .usage('[options] <file|folder>')
    .option('-o, --output <output name>', 'set filename or folder for output')
    .addOption(optionFormat)
    .addOption(optionCharset)
    .addOption(optionMethod)
    .addOption(optionBackground)
    .option('--loadConfig <filename>', 'load config from a json file')
    .option('--saveConfig <filename>', 'saves config to a json file')
    .option('--overwrite', 'force overwrite of existing files')
    .option('--mono', 'single color mode')
    .addOption(optionThreshold)
    .parse(process.argv)

  const inputName: string = cli.args[0]

  if (inputName === undefined) {
    cli.help()
  }

  try {
    const options: CliOptions = cli.opts()
    let config: Config = fromCliOptions(options)

    const filenames: string[] = await toFilenames(inputName, supportedExtensions)
    const firstImage: SharpImage = await loadFile(filenames[0], config)
    const backgroundColor: number = getBackgroundColor(firstImage)

    if (options.loadConfig) {
      config = await loadConfig(options.loadConfig)
    }
    if (options.saveConfig) {
      await validateOutputFilename(options.saveConfig, config.overwrite)
    }

    // slow matchtype is nonsense in mono mode, so override with fast
    if (options.mono) {
      if (options.method === MatchType.slow) {
        console.log('Warning: option --slow has no effect when also using --mono')
      }
      options.method = MatchType.fast
    }

    const charSet: CharSet = await readRomCharSet(config.charSetType)
    const screens: Screen[] = await Promise.all(filenames.map((f: string) => convertFile(f, charSet, backgroundColor, config)))

    // petmate output
    if (config.format == FormatType.petmate) {
      const outputName: string = options.output ?? changeExtension(inputName, 'petmate')
      await validateOutputFilename(outputName, config.overwrite)
      await savePetmate(screens, outputName, config)
      console.log(`Output: ${outputName}`)
    }

    // png output
    if (config.format == FormatType.png) {
      const basename: string = filenameWithouthExtension(inputName)
      let outputName: string = options.output

      if (!outputName) {
        outputName = basename
        await validateOutputFilename(outputName, config.overwrite)
      } else {
        if (await folderExists(outputName)) {
          outputName = path.join(outputName, 'out')
        }
      }

      await saveScreens(screens, charSet, outputName, config.overwrite)
    }

    if (options.saveConfig) {
      await saveConfig(config, options.saveConfig)
    }
  } catch (err) {
    console.log(`\n${err}.\n`)
    cli.help()
  }
})()
