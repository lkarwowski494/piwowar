module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/tests/**/*.test.ts']
};
