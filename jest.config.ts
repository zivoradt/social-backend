import type {Config} from '@jest/types';

const config: Config.InitialOptions = {

    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverage: true,
    testPathIgnorePatterns: ['/node_modules'],
    transform: {
      '^.+\\.ts?$': 'ts-jest'
    },

    testMatch: ['<rootDir>/src/**/test/*.test.ts'],
    collectCoverageFrom: ['./src/**/*.test.ts','!src/**/test/*.ts?(x)','!**/node_modules/**'],
    coverageThreshold: {
      global: {
        branches:1,
        functions: 1,
        lines: 1,
        statements: 1
      }
    },
    coverageReporters: ['text-summary', 'lcov'],
    verbose: true,
    moduleNameMapper: {
      '@auth/(.*)':['<rootDir>/src/features/auth/$1'],
      '@post/(.*)':['<rootDir>/src/features/post/$1'],
      '@user/(.*)':['<rootDir>/src/features/user/$1'],
      '@global/(.*)':['<rootDir>/src/shared/globals/$1'],
      '@services/(.*)':['<rootDir>/src/shared/services/$1'],
      '@sockets/(.*)':['<rootDir>/src/shared/sockets/$1'],
      '@workers/(.*)':['<rootDir>/src/shared/workers/$1'],
      '@root/(.*)':['<rootDir>/src/$1'],
    },

};

export default config;
