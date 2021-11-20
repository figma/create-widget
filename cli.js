#!/usr/bin/env node
import sade from 'sade'

import { createWidget } from './create-widget.js'

sade('create-widget', true)
  .describe('Create a new widget')
  .option('-p, --path', 'Destination path of your widget; defaults to my-custom-widget')
  .option('-n, --name', 'Name of your widget; defaults to MyCustomWidget')
  .action(async function (
    options,
  ) {
    await createWidget({
      options,
    })
  })
  .parse(process.argv)