#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import cp from 'child_process'

import { fileURLToPath } from 'url'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function installDependenciesAsync(cwd) {
  await new (function (resolve, reject) {
    const command = 'npm ci'
    cp.exec(command, { cwd }, function (error) {
      if (error) {
        reject(error)
        return
      }
      path.resolve()
    })
  })
}

async function copyTemplateAsync(
  templateName,
  pluginDirectoryPath
) {
  const templateDirectory = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'create-widget-test',
    templateName
  )
  await fs.copy(templateDirectory, pluginDirectoryPath)
  const npmIgnoreFile = path.join(pluginDirectoryPath, '.npmignore')
  if ((await fs.pathExists(npmIgnoreFile)) === true) {
    // When running via npm/npx, the .gitignore file is renamed to .npmignore,
    // so we need to rename it back
    const gitIgnoreFile = path.join(pluginDirectoryPath, '.gitignore')
    await fs.move(npmIgnoreFile, gitIgnoreFile)
  }
}


async function createWidgetAsync(destinationPath) {
  try {
    console.log("Creating widget async")
    const templateName = 'widget-template'
    let directoryPath = path.join(process.cwd(), destinationPath)
    let actualDestinationPath
    while ((await fs.pathExists(directoryPath)) === true) {
      throw new Error(`${destinationPath} already exists. Please choose a different destination folder name.`)
    }
    console.log(`Copying "${templateName}" template into "${destinationPath}"...`)
    await copyTemplateAsync(templateName, directoryPath)
    console.log('Installing dependencies...')
    await installDependenciesAsync(directoryPath)
    console.log('Done')
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

if (process.argv[2] === undefined) {
  throw new Error("Please specify a destination folder name.")
}
createWidgetAsync(process.argv[2])
