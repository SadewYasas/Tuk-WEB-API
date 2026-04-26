module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!node_modules/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
