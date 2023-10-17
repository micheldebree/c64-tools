#!/usr/bin/env node
import sharp, { Sharp } from 'sharp'
import { convertImage, getBackgroundColor, supportedExtensions } from './img2petscii.js'
import { Command, Option } from 'commander'
import { checkOverwrite, createOutputname, filenameWithouthExtension, relativePath, toFilenames } from './utils.js'
import { SharpImage } from './graphics.js'
import { Petmate, toPetmate } from './petmate.js'
import { Screen } from './model.js'
import { writeFile } from 'node:fs/promises'
import { CharsetType, CliOptions, Config, fromCliOptions, loadConfig, saveConfig } from './config.js'
import { CharSet, readChars } from './charset.js'

// TODO get version from package.json
const version = '0.0.7'
const cols = 40
const rows = 25
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

async function loadCharset(config: Config): Promise<CharSet> {
  const offset: number = config.charSetType === CharsetType.lowercase ? 256 : 0
  return await readChars(relativePath('./characters.901225-01.bin'), offset)
}

async function savePetmate(screens: Screen[], filename: string, config: Config): Promise<void> {
  const petmateCharset: 'lower' | 'upper' = config.charSetType === CharsetType.lowercase ? 'lower' : 'upper'
  const petmate: Petmate = toPetmate(screens, petmateCharset)
  await writeFile(filename, JSON.stringify(petmate))
}

await (async function (): Promise<void> {
  const optionBackground: Option = new Option('-b, --background <method>', 'method for choosing background color')
    .choices(['optimal', 'firstPixel'])
    .default('optimal')

  const optionMethod: Option = new Option('-m, --method <method>', 'method for matching PETSCII characters')
    .choices(['slow', 'fast'])
    .default('slow')

  const optionCharset: Option = new Option('-c, --charset <name>', 'which ROM character set to use')
    .choices(['uppercase', 'lowercase'])
    .default('uppercase')

  const optionThreshold: Option = new Option('--threshold <value>', 'threshold (0-255) for --mono mode').default(128)

  const cli: Command = new Command()
    .version(version)
    .description('Convert images to PETSCII')
    .usage('[options] <file|folder>')
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
    process.exit(1)
  }

  try {
    const options: CliOptions = cli.opts()
    let config: Config = fromCliOptions(options)

    const outputName: string = await createOutputname(inputName, 'petmate', config.overwrite)
    const filenames: string[] = await toFilenames(inputName, supportedExtensions)
    const firstImage: SharpImage = await loadFile(filenames[0], config)
    const backgroundColor: number = getBackgroundColor(firstImage)

    if (options.loadConfig) {
      config = await loadConfig(options.loadConfig)
    }
    if (options.saveConfig) {
      await checkOverwrite(options.saveConfig, config.overwrite)
    }

    const charSet: CharSet = await loadCharset(config)
    const screens: Screen[] = await Promise.all(filenames.map((f: string) => convertFile(f, charSet, backgroundColor, config)))

    await savePetmate(screens, outputName, config)

    if (options.saveConfig) {
      await saveConfig(config, options.saveConfig)
    }

    // const charsetImg: Sharp = await renderCharSet(charSet)
    // charsetImg.toFile('test.png')

    console.log(`Output: ${outputName}`)
  } catch (err) {
    console.log(`\nERROR: ${err}.\n`)
    cli.help()
    process.exit(1)
  }
})()
