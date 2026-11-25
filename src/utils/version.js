// App version, taken from package.json at build time (see vite.config.js).
// To release a new version, change "version" in package.json (e.g. 1.0.1 -> 1.0.2).
/* global __APP_VERSION__ */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
