import pkg from '../../package.json'

/**
 * App version, sourced from package.json. Bump in package.json and the value
 * propagates everywhere it's referenced (sidebar brand, footer, meta, etc.).
 */
export const APP_VERSION: string = pkg.version

/** "v2.4" formatted for display in chrome (sidebar / footer). */
export const APP_VERSION_LABEL: string = `v${APP_VERSION}`
