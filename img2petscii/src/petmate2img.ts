#!/usr/bin/env node
import { Command } from 'commander'
import { FrameBuf, fromJSON, Petmate, toScreen } from './petmate.js'
import { readFile } from 'node:fs/promises'
import { saveScreens } from './png.js'
import { CharSet, readRomCharSet } from './charset.js'
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

    const lowercase: boolean = petmate.framebufs[0].charset === 'lower'
    const charset: CharSet = await readRomCharSet(lowercase)

    const screens: Screen[] = petmate.framebufs.map((frame: FrameBuf) => toScreen(frame))

    const outputBasename: string = filenameWithouthExtension(inputName)
    await saveScreens(screens, charset, outputBasename)
  } catch (err) {
    console.log(`\nERROR: ${err}.\n`)
    cli.help()
  }
})()
