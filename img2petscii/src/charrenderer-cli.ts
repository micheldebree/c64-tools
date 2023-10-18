#!/usr/bin/env node
import { Command } from 'commander'
import { createOutputname } from './utils.js'
import { CharSet, readChars } from './charset.js'
import { renderCharSet } from './charrenderer.js'
import { Sharp } from 'sharp'

const version = '0.0.1'

await (async function (): Promise<void> {
  const cli: Command = new Command()
    .version(version)
    .description('Render a charset to an image')
    .usage('<file>')
    .parse(process.argv)

  const inputName: string = cli.args[0]
  if (inputName === undefined) {
    cli.help()
  }

  const outputName: string = await createOutputname(inputName, 'png', false)
  const charset: CharSet = await readChars(inputName)
  const image: Sharp = await renderCharSet(charset)

  await image.toFile(outputName)
  console.log(outputName)
})()
