#!/usr/bin/env node
import sharp from 'sharp'
import { convertImage, supportedExtensions, getBackgroundColor } from './img2petscii.js'
import { Command, Option } from 'commander'
import { toFilenames, relativePath } from './utils.js'
import { readChars, SharpImage, CharSet } from './graphics.js'
import { Petmate, toPetmate, Screen } from './petmate.js'
import { writeFile } from 'node:fs/promises'
import { Config, defaultConfig, saveConfig, loadConfig, CharsetType } from './config.js'

const cols = 40
const rows = 25
const width: number = cols * 8
const height: number = rows * 8

// load and scale the image
async function loadFile (filename: string): Promise<SharpImage> {
  return await sharp(filename).resize(width, height).removeAlpha().raw().toBuffer({ resolveWithObject: true })
}
// convert an image file to a 40x25 array of screencodes
async function convertFile (filename: string, charSet: CharSet, firstPixelColor: number, config: Config): Promise<Screen> {
  console.log(`Input: ${filename}`)
  const image: SharpImage = await loadFile(filename)
  return convertImage(image, charSet, firstPixelColor, config)
}

async function loadCharset (config: Config): Promise<CharSet> {
  const offset: number = config.charSetType === CharsetType.lowercase ? 256 : 0
  return await readChars(relativePath('./characters.901225-01.bin'), offset)
}

(async function () {
  const cli = new Command()

  const optionBackground = new Option('-b, --background <method>', 'method for choosing background color')
    .choices(['optimal', 'firstPixel'])
    .default('optimal')

  const optionMethod = new Option('-m, --method <method>', 'method for matching PETSCII characters')
    .choices(['slow', 'fast'])
    .default('slow')

  const optionCharset = new Option('-c, --charset <name>', 'which ROM character set to use')
    .choices(['uppercase', 'lowercase'])
    .default('uppercase')

  cli
    .version('0.0.4')
    .description('Convert images to PETSCII')
    .usage('[options] <image file|folder>')
    .addOption(optionCharset)
    .addOption(optionMethod)
    .addOption(optionBackground)
    .option('--loadConfig <filename>', 'load config from a json file')
    .option('--saveConfig <filename>', 'saves config to a json file')
    .parse(process.argv)

  const inputName: string = cli.args[0]

  if (inputName === undefined) {
    cli.help()
    process.exit(1)
  }

  // TODO: check for file override

  try {
    const outputName = `${inputName}.petmate`
    const filenames: string[] = await toFilenames(inputName, supportedExtensions)
    const firstImage: SharpImage = await loadFile(filenames[0])
    const backgroundColor = await getBackgroundColor(firstImage)

    let config = defaultConfig
    const options = cli.opts()
    config.backgroundDetectionType = options.background
    config.matchType = options.method
    config.charSetType = options.charset

    if (options.loadConfig) {
      config = await loadConfig(options.loadConfig)
    }

    const charSet: CharSet = await loadCharset(config)
    const screens: Screen[] = await Promise.all(filenames.map(async f => await convertFile(f, charSet, backgroundColor, config)))

    const petmateCharset = config.charSetType === CharsetType.lowercase ? 'lower' : 'upper'
    const petmate: Petmate = toPetmate(screens, petmateCharset)
    await writeFile(outputName, JSON.stringify(petmate))
    if (options.saveConfig) {
      await saveConfig(config, options.saveConfig)
    }

    // const charsetImg: Sharp = await renderCharSet(charSet)
    // charsetImg.toFile('test.png')

    console.log(`Output: ${outputName}`)
  } catch (err) {
    console.log(`\nERROR: ${err.message}.\n`)
    console.log(err)
    cli.help()
    process.exit(1)
  }
})()
