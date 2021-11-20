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
    const result = await inquirer.prompt([
      {
        choices: ["Y", "N"],
        message: 'Are you planning to build a widget with UI?',
        name: 'widgetHasUI',
        type: 'list'
      }
    ])
    const shouldAddUI = result.widgetHasUI === 'Y'
    const shouldAddUIText = shouldAddUI ? 'with ui' : 'without ui'

    console.log(`Creating widget ${shouldAddUIText}...`)
    const destinationPath = input.options.path ? input.options.path : 'my-custom-widget'
    let directoryPath = path.join(process.cwd(), destinationPath)
    while ((await fs.pathExists(directoryPath)) === true) {
      throw new Error(`${destinationPath} already exists. Please choose a different destination folder name.`)
    }

    console.log(`Copying template into "${destinationPath}"...`)

    await copyTemplateFiles(directoryPath, shouldAddUI)
    const widgetName = input.options.name ? input.options.name : 'MyCustomWidget'
    await replaceTemplatizedValues(directoryPath, { widgetName })

    console.log('Installing dependencies...')
    await installDependencies(directoryPath)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
