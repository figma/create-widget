import fs from 'fs-extra'
import path from 'path'
import cp from 'child_process'

import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import { globby } from 'globby'
import isUtf8 from 'is-utf8'
import mustache from 'mustache'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

async function installDependencies(cwd) {
  await new (function (resolve, reject) {
    const command = 'npm install && npm ci && npm run build'
    cp.exec(command, { cwd }, function (error) {
      if (error) {
        reject(error)
        return
      }
      path.resolve()
      console.log('Done')
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
    'node_modules',
    'create-widget-test',
    'templates',
    templateName
  )
  await fs.copy(templateDirectory, pluginDirectoryPath)
}


export async function createWidget(input) {
  try {
    let destinationPath = input.options.path
    if (destinationPath === undefined) {
      const result = await inquirer.prompt([
        {
          message: 'Enter the destination path for your widget: (empty defaults to "my-custom-widget")',
          name: 'destinationPath',
          type: 'input'
        }
      ])
      destinationPath = result.destinationPath ? result.destinationPath : 'my-custom-widget'
    }
    let directoryPath = path.join(process.cwd(), destinationPath)
    while ((await fs.pathExists(directoryPath)) === true) {
      throw new Error(`${destinationPath} already exists. Please choose a different destination folder name.`)
    }



    let widgetName = input.options.name
    if (widgetName === undefined) {
      const result = await inquirer.prompt([
        {
          message: 'Enter the name for your widget: (empty defaults to "MyCustomWidget")',
          name: 'widgetName',
          type: 'input'
        }
      ])
      widgetName = result.widgetName ? result.widgetName : 'MyCustomWidget'
    }

    const result = await inquirer.prompt([
      {
        choices: ["Y", "N"],
        message: 'Are you building a widget with an iFrame?',
        name: 'shouldAddIframe',
        type: 'list'
      }
    ])
    const shouldAddUI = result.shouldAddIframe === 'Y'
    const shouldAddUIText = shouldAddUI ? 'with ui' : 'without ui'

    console.log(`Creating widget ${shouldAddUIText}...`)

    console.log(`Copying template into "${destinationPath}"...`)

    await copyTemplateFiles(directoryPath, shouldAddUI)
    await replaceTemplatizedValues(directoryPath, { widgetName })

    console.log('Installing dependencies: npm install && npm ci && npm run build')
    await installDependencies(directoryPath)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
