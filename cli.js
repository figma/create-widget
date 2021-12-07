#!/usr/bin/env node
import sade from 'sade'

import { createWidget } from './create-widget.js'

const description = `
    Create a FigJam widget with a single command

  Examples
    $ npm init @figma/widget
    $ npm init @figma/widget -n Counter
    $ npm init @figma/widget -n Counter -p counter-widget --iframe=Y
`

sade('create-widget', true)
  .describe(description)
  .option('-n, --name', 'Name of your widget; defaults to "Widget"')
  .option('-p, --package-name', 'Name of the folder containing your widget; defaults to "<name>-widget"')
  .option('-i, --iframe', 'Whether the widget uses an iframe')
  .action(async function (options) {
    await createWidget({ options })
  })
  .parse(process.argv)