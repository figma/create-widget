# create-widget-app

Template app that creates a widget.

Code organization:

| dir / path               | description                          |
| ------------------------ | ------------------------------------ |
| widget-src/              | This is where the widget code lives  |
| widget-src/code.tsx      | Main entry point for the widget code |
| widget-src/tsconfig.json | tsconfig for the widget code         |
| dist/                    | Built output goes here               |

- The widget code just uses esbuild to bundle widget-src/code.tsx into one file.

## Getting started

### One-time setup
1. Make a copy of this folder
2. Update manifest.json, package.json and package-lock.json where it says `WidgetTemplate`
3. Install the required dependencies `npm ci`


### Importing your widget
1. "Import widget from manifest"
2. Build code `npm run build`
3. Choose your manifest


## Development

The quickest way to build your widget during development is by running:

```sh
npm run dev
```

This command starts the follow in watch mode:
1. typechecking for widget-src
2. bundling for widget-src

## Other scripts

| script                   | description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| npm run build            | one-off full build of the widget code                                   |
| npm run build:production | one-off full production (minified) build of the widget                  |
| npm run tsc              | typecheck the widget                                                    |
