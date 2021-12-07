import fs from 'fs-extra'
import path from 'path'
import cp from 'child_process'

import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import { globby } from 'globby'
import isUtf8 from 'is-utf8'
import mustache from 'mustache'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
 }
 return result;
}

function randomWidgetId() {
  return "widget-id-" + makeid(10)
}

export async function replaceTemplatizedValues(
  directory,
  values
) {
  const filePaths = await globby('**/*', {
    cwd: directory,
    dot: true
  })
  await Promise.all(
    filePaths.map(async function (filePath) {
      const absolutePath = path.join(directory, filePath)
      const buffer = await fs.readFile(absolutePath)
      const fileContents = isUtf8(buffer)
        ? mustache.render(buffer.toString(), values)
        : buffer
      await fs.outputFile(absolutePath, fileContents)
    })
  )
}

async function installDependencies(cwd, destinationPath) {
  await new (function (resolve, reject) {
    const command = 'npm install'
    cp.exec(command, { cwd }, function (error) {
      if (error) {
        reject(error)
        return
      }
      path.resolve()

      console.log()
      console.log(`
Your widget has been created! Run the following commands to get started building:

  cd ${destinationPath}
  npm run dev
`)
    })
  })
}

async function copyTemplateFiles(
  pluginDirectoryPath,
  shouldAddUI
) {
  const templateName = shouldAddUI ? 'widget-with-ui' : 'widget-without-ui'
  const templateDirectory = path.resolve(
    __dirname,
    '..',
    'create-widget',
    'templates',
    templateName
  )
  await fs.copy(templateDirectory, pluginDirectoryPath)
}


export async function createWidget(input) {
  console.log(input)
  try {
    console.log(`This tool will create a FigJam widget using a template.
It aims to provide an extensible starting point with sensible defaults for building your widget.

See the generated README.md for more information for how to use this template and get started building your widget.

You can find API reference for widgets here: https://www.figma.com/widget-docs/api/api-reference/

Press ^C at any time to quit.\n`)
    let widgetName = input.options.name
    if (widgetName === undefined) {
      const result = await inquirer.prompt([
        {
          message: 'Enter the name of your widget: (empty defaults to "Widget")',
          name: 'widgetName',
          type: 'input'
        }
      ])
      widgetName = result.widgetName ? result.widgetName : 'Widget'
    }

    let destinationPath = input.options['package-name']
    if (destinationPath === undefined) {
      const defaultDestinationPath = `${widgetName.toLowerCase()}-widget`
      const result = await inquirer.prompt([
        {
          message: `Enter the folder name for your widget: (empty defaults to "${defaultDestinationPath}")`,
          name: 'destinationPath',
          type: 'input'
        }
      ])
      destinationPath = result.destinationPath ? result.destinationPath : defaultDestinationPath
    }

    let directoryPath = path.join(process.cwd(), destinationPath)
    while ((await fs.pathExists(directoryPath)) === true) {
      throw new Error(`${destinationPath} already exists. Please choose a different destination folder name.`)
    }

    let shouldAddUI = input.options.iframe
    if (shouldAddUI === undefined) {
      const result = await inquirer.prompt([
        {
          choices: ["Y", "N"],
          message: 'Are you building a widget with an iframe?',
          name: 'shouldAddIframe',
          type: 'list'
        }
      ])
      shouldAddUI = result.shouldAddIframe === 'Y'
    }

    console.log(``)
    console.log(`Creating widget ${shouldAddUI ? 'with ui' : 'without ui'}...`)
    console.log(`Copying template into "${destinationPath}"...`)

    await copyTemplateFiles(directoryPath, shouldAddUI)
    await replaceTemplatizedValues(directoryPath, {
      widgetName,
      widgetId: randomWidgetId(),
      packageName: widgetName.toLowerCase()
    })

    console.log('Installing dependencies...')
    await installDependencies(directoryPath, destinationPath)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
