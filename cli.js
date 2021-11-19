#!/usr/bin/env node
import sade from 'sade'

import { createWidgetAsync } from './create-widget.js'

sade('create-widget', true)
  .describe('Create a new widget')
  .option('-n, --name', 'Custom name of your widget; defaults to widget-template')
  .action(async function (
    options,
  ) {
    await createWidgetAsync({
      options,
    })
  })
  .parse(process.argv)