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
Done. Now run:

  cd ${destinationPath}
  npm run build
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
    'node_modules',
    'create-widget',
    'templates',
    templateName
  )
  await fs.copy(templateDirectory, pluginDirectoryPath)
}


export async function createWidget(input) {
  try {
    console.log(`This tool will create a widget using a Figma widget template.
It only covers some of the most common usages and defaults.

See our guide: https://www.figma.com/widget-docs/intro/
for more details on how to handle user events, iframes, add a property menu, etc; as well as what each of these files do.

See our API reference docs: https://www.figma.com/widget-docs/api/api-reference/
to reference definitive documentation on our API and exactly what each field does.

Press ^C at any time to quit.`)
    console.log()
    let destinationPath = input.options.path
    if (destinationPath === undefined) {
      const result = await inquirer.prompt([
        {
          message: 'Enter the folder name for your widget: (empty defaults to "my-custom-widget")',
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
          message: 'Enter the name of your widget: (empty defaults to "MyCustomWidget")',
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

    console.log()
    console.log(`Creating widget ${shouldAddUIText}...`)
    console.log(`Copying template into "${destinationPath}"...`)

    await copyTemplateFiles(directoryPath, shouldAddUI)
    await replaceTemplatizedValues(directoryPath, { widgetName })

    console.log('Installing dependencies...')
    await installDependencies(directoryPath, destinationPath)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
