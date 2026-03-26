module.exports = {
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.[t|j]s?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
  testMatch: ['**/tests/unit/**/*.spec.[jt]s?(x)'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}
