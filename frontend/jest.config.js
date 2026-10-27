module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jest-preset-angular/environments/jest-jsdom-env',
  moduleFileExtensions: ['ts', 'js', 'html', 'json', 'mjs'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transformIgnorePatterns: ['/node_modules/(?!.*\\.mjs$)/'],
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
};
