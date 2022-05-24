const { existsSync } = require('fs')
const { copyFile, rename, unlink } = require('fs').promises
const { execSync } = require('child_process')
const { RNBPlugin } = require("@thecodingmachine/rnb-toolbox")

const plugin = new RNBPlugin({
  organisation: '@thecodingmachine',
  packageName: 'rnb-plugin-typescript',
  promptsOptions: {
    type: 'confirm',
    color: 'blue',
    text: '📘 Using typescript ?',
    initial: false,
  }
});

plugin.lifecycle.onInstall = async () => {
  // Loop on plugin files to copy them in the final source directory
  await plugin.helpers.loopOnPluginFiles({
    onFileFound: async ({ item, rootDir, accumulatedPath }) => {
      const [name] = item.split('.');
      // Copy the ts file in the src associated path
      await copyFile(
        `${rootDir}${accumulatedPath}${item}`,
        `${plugin.TEMPLATE_PATH}${accumulatedPath}${item}`,
      );
      // If a same name js file is found, delete it
      if (existsSync(`${plugin.TEMPLATE_PATH}${accumulatedPath}${name}.js`)) {
        return unlink(`${plugin.TEMPLATE_PATH}${accumulatedPath}${name}.js`);
      }
      return Promise.resolve(true);
    },
  });

  // Loop on source files to rename them in the final source directory
  await plugin.helpers.loopOnSourceFiles({
    isTsx: true,
    onFileFound: async ({item, rootDir, accumulatedPath, next, isTsx}) => {
      const [name, extension] = item.split('.');
      if (extension === 'js') {
        let fileExtension = '.ts';
        const firstCharIsUpperCase = name.charAt(0).toUpperCase() === name.charAt(0);
        if (isTsx && firstCharIsUpperCase) {
          fileExtension = '.tsx';
        }
        return rename(
          `${rootDir}${accumulatedPath}${item}`,
          `${rootDir}${accumulatedPath}${name}${fileExtension}`,
        );
      }
      return Promise.resolve();
    },
    onDirectoryFound: async ({ item, rootDir, accumulatedPath, next, isTsx}) => {
      const EXCLUDED_DIRECTORIES = ['Assets', 'Config']
      const TSX_DIRECTORIES = ['Components', 'Containers', 'Navigators']

      const tsxCondition = accumulatedPath === '/'
          ? TSX_DIRECTORIES.includes(item)
          : isTsx || TSX_DIRECTORIES.includes(item)
      if (!EXCLUDED_DIRECTORIES.includes(item)) {
        return next({isTsx: tsxCondition})
      }

      return Promise.resolve();
    },
  });
}

plugin.lifecycle.afterInstall = async () => {
  await copyFile(
    `${plugin.TEMPLATE_PATH}/src/Config/index.example.js`,
    `${plugin.TEMPLATE_PATH}/src/Config/index.ts`,
  )
  await rename(
    `${plugin.TEMPLATE_PATH}/src/Config/index.example.js`,
    `${plugin.TEMPLATE_PATH}/src/Config/index.example.ts`,
  )
  await execSync(
    'yarn add -D typescript @types/jest @types/react @types/react-native @types/react-test-renderer @types/fbemitter @types/react-redux',
    { stdio: 'pipe' },
  )
  await execSync(
    'yarn lint --fix',
    { stdio: 'pipe' },
  )
}

module.exports = plugin
