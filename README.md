# @figma/create-widget

[![npm](https://img.shields.io/npm/v/@figma/create-widget?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/@figma/create-widget)

Create new [Figma & FigJam widgets](https://figma.com/widget-docs) with a single command.

```bash
npm init @figma/widget
```

## Widget Organization

The created widgets use:

- [esbuild](https://esbuild.github.io/) for bundling
- [vite](https://vitejs.dev/) and [react](https://reactjs.org/) if the iframe option is specified
- [typescript](https://www.typescriptlang.org/) for typechecking

| file/folder   | description                                                                      |
| ------------- | -------------------------------------------------------------------------------- |
| manifest.json | The widget's [manifest.json](https://www.figma.com/widget-docs/widget-manifest/) |
| widget-src/   | Contains the widget code                                                         |
| ui-src/       | Contains the iframe code                                                         |

## Getting Started

After running `npm init @figma/widget`, follow the provided prompts.

### `npm run dev`

This is the only command you need to run in development. It will start the following processes for you:

- bundling (both widget and iframe code)
- typechecking (both widget and iframe code)
- vite dev server (for iframe development)

### `npm run build`

This runs bundling with minification turned on. You should run this command before releasing your widget.

### `npm run test`

This runs typechecking and makes sure that your widget builds without errors.

## Credit

Credit to https://github.com/yuanqing/create-figma-plugin for providing a way to `npm init` widgets and plugins before this repository ever existed.
