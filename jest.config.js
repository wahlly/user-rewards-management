module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testTimeout: 30000,
  maxWorkers: '50%',

  testRegex: '.*\\.(spec|e2e-spec|integration-spec)\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.d.ts',
    '!src/config/**',
  ],

  coverageDirectory: 'coverage',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/modules/**/test/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      testEnvironment: 'node',
      testTimeout: 20000,
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/modules/**/test/*.integration-spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      testEnvironment: 'node',
      testTimeout: 45000,
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      testEnvironment: 'node',
      testTimeout: 60000,
    },
  ],
};
