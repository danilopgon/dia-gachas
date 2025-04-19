import { pathsToModuleNameMapper } from 'ts-jest';
import * as fs from 'fs';
import * as path from 'path';

const getTsConfig = () => {
  try {
    const tsconfigPath = path.resolve(__dirname, './tsconfig.json');
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const jsonContent = tsconfigContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('Error parsing tsconfig.json:', e);
    return { compilerOptions: {} };
  }
};

const { compilerOptions } = getTsConfig();

const tsConfig = compilerOptions as {
  paths?: Record<string, string[]>;
  [key: string]: unknown;
};

export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup.jest.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: tsConfig.paths
    ? pathsToModuleNameMapper(tsConfig.paths, {
        prefix: '<rootDir>/',
      })
    : {},
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
