module.exports = {
  src_folders: ['src/tests/e2e'],
  webdriver: {
    start_process: true,
    server_path: 'node_modules/.bin/chromedriver',
    port: 8080,
    host: 'localhost',
    ssl: false,
    default_path_prefix: '',
    proxy: undefined,
    cli_args: {},
  },
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
  },
}
