import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  vite: {
    resolve: {
      alias: {
        'react/compiler-runtime': 'react-compiler-runtime',
      },
    },
  },
  // @ts-expect-error — typegen is a valid CLI config key but missing from CliConfig types in this version
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx,js,jsx}',
    schema: './schema.json',
    generates: '../web/src/sanity/types.ts',
  },
})
