import fs from 'fs-extra'
import path from 'path'
import cp from 'child_process'

import { fileURLToPath } from 'url'
import inquirer from 'inquirer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function installDependenciesAsync(cwd) {
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

async function copyTemplateAsync(
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


export async function createWidgetAsync(input) {
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
    const destinationPath = input.options.name ? input.options.name : 'widget-template'
    let directoryPath = path.join(process.cwd(), destinationPath)
    let actualDestinationPath
    while ((await fs.pathExists(directoryPath)) === true) {
      throw new Error(`${destinationPath} already exists. Please choose a different destination folder name.`)
    }

    console.log(`Copying template ${shouldAddUIText} into "${destinationPath}"...`)
    await copyTemplateAsync(directoryPath, shouldAddUI)
    console.log('Installing dependencies...')
    await installDependenciesAsync(directoryPath)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
