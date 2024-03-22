# Magic Backup Importer

This app is placed on the `discohook.org` domain and allows users to transfer their local browser backups to the cloud (`discohook.app`).

## Development

- Clone the repository and navigate to this package
- Create a `.dev.vars` file and populate it:
  - `DISCOHOOK_ORIGIN` - the [origin](https://developer.mozilla.org/en-US/docs/Web/API/URL/origin) of your Discohook process
- Install dependencies with `yarn install`
- Run `yarn dev`

## Attribution

Files in the `app/database` directory were borrowed and modified from the original [discohook/site](https://github.com/discohook/site/tree/daf7be22e0887caa96a36f3bdd49fbaad877d3d8/modules/database) around March 15, 2024, licensed under AGPL-3.0.
