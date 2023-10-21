#!/usr/bin/env node
import { Command } from 'commander'
import { fromJSON, Petmate, PetmateCharset, toScreens } from './petmate.js'
import { readFile } from 'node:fs/promises'
import { saveScreens } from './png.js'
import { CharSet, readRomCharSet, ROMCharsetType } from './charset.js'
import { Screen } from './model.js'
import { filenameWithouthExtension } from './utils.js'

await (async function (): Promise<void> {
  const cli: Command = new Command()

  cli.version('0.0.1').description('Convert a Petmate file to image(s)').usage('[options] <petmate file>').parse(process.argv)

  const inputName: string = cli.args[0]

  if (inputName === undefined) {
    cli.help()
  }

  try {
    const buf: Buffer = await readFile(inputName)
    const petmate: Petmate = fromJSON(buf.toString())

    const charsetType: ROMCharsetType =
      petmate.framebufs[0].charset === PetmateCharset.lowercase.toString() ? ROMCharsetType.lowercase : ROMCharsetType.uppercase
    const charset: CharSet = await readRomCharSet(charsetType)

    const screens: Screen[] = toScreens(petmate)

    const outputBasename: string = filenameWithouthExtension(inputName)
    await saveScreens(screens, charset, outputBasename, false)
  } catch (err) {
    console.log(`\nERROR: ${err}.\n`)
    cli.help()
  }
})()
