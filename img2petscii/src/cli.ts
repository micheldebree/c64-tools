#!/usr/bin/env node
import sharp from 'sharp'
import { convertImage, supportedExtensions, getBackgroundColor } from './img2petscii.js'
import { Command, Option } from 'commander'
import { toFilenames, relativePath } from './utils.js'
import { readChars, SharpImage, CharSet } from './graphics.js'
import { Petmate, toPetmate, Screen } from './petmate.js'
import { writeFile } from 'node:fs/promises'
import { Config, defaultConfig, saveConfig } from './config.js'

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
  const image: SharpImage = await loadFile(filename)
  return convertImage(image, charSet, firstPixelColor, config)
}

(async function () {
  const cli = new Command()

  const optionBackground = new Option('-b, --background <method>', 'method for choosing background color')
    .choices(['optimal', 'firstPixel'])
    .default('optimal')

  const optionMethod = new Option('-m, --method <method>', 'method for matching PETSCII characters')
    .choices(['slow', 'fast'])
    .default('slow')

  cli
    .version('0.0.2')
    .description('Convert images to PETSCII')
    .usage('[options] <image file|folder>')
    .addOption(optionMethod)
    .addOption(optionBackground)
    .option('--saveConfig <filename>', 'saves config to a json file')
    .parse(process.argv)

  const options = cli.opts()

  const inputName: string = cli.args[0]

  if (inputName === undefined) {
    cli.help()
    process.exit(1)
  }

  const config = defaultConfig
  config.backgroundDetectionType = options.background
  config.matchType = options.method

  // TODO: check for file override

  try {
    const outputName = `${inputName}.petmate`
    const filenames: string[] = await toFilenames(inputName, supportedExtensions)
    const charSet: CharSet = await readChars(relativePath('./characters.901225-01.bin'))
    const firstImage: SharpImage = await loadFile(filenames[0])
    const backgroundColor = await getBackgroundColor(firstImage)
    const screens: Screen[] = await Promise.all(filenames.map(async f => await convertFile(f, charSet, backgroundColor, config)))
    const petmate: Petmate = toPetmate(screens)
    await writeFile(outputName, JSON.stringify(petmate))
    if (options.saveConfig) {
      await saveConfig(config, options.saveConfig)
    }
    console.log(`Output: ${outputName}`)
  } catch (err) {
    console.log(`\nERROR: ${err.message}.\n`)
    cli.help()
    process.exit(1)
  }
})()
