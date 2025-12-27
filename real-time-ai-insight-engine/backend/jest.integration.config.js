module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/integration'],
  testMatch: ['**/*.integration.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage/integration',
  testTimeout: 30000,
  verbose: true,
  maxWorkers: 1, // Run integration tests sequentially
};

