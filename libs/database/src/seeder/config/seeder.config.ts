export const SEEDER_FILES_PATH: string =
  process.env.NODE_ENV === 'production'
    ? 'dist/src/domains/**/*.seeder.js'
    : 'src/domains/**/*.seeder.ts';
export const SEEDER_MODULE_NAME: string = 'SEEDER';
