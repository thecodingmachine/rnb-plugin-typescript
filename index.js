const { existsSync } = require('fs')
const { copyFile, rename, unlink } = require('fs').promises
const { execSync } = require('child_process')
const RNBPluginBuilder = require("rnb-toolkit").default;

const builder = new RNBPluginBuilder(
  '@thecodingmachine',
  'rnb-plugin-typescript',
);

const promptsOptions = builder.buildPromptsOptions({
  type: 'confirm',
  color: 'blue',
  text: '📘 Using typescript ?',
  initial: false,
});

const apply = async (
  value,
  previousValues,
) => builder.buildApplyPlugin(
  value,
  previousValues,
  async () => {
    /**
     * Loop on plugin files to copy them in the final source directory
     */
    await builder.onEachPluginFiles({
      callback: async ({ item, rootDir, accumulatedPath }) => {
        const [name] = item.split('.');
        // Copy the ts file in the src associated path
        await copyFile(
          `${rootDir}${accumulatedPath}${item}`,
          `${RNBPluginBuilder.TEMPLATE_PATH}${accumulatedPath}${item}`,
        );
        // If a same name js file is found, delete it
        if (existsSync(`${RNBPluginBuilder.TEMPLATE_PATH}${accumulatedPath}${name}.js`)) {
          return unlink(`${RNBPluginBuilder.TEMPLATE_PATH}${accumulatedPath}${name}.js`);
        }
        return Promise.resolve(true);
      },
    });

    await builder.onEachSourceFiles({
      isTsx: true,
      callback: async ({
        item, isTsx, rootDir, accumulatedPath,
      }) => {
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
    });
  },
  async () => {
    await execSync(
      'yarn add -D typescript @types/jest @types/react @types/react-native @types/react-test-renderer @types/fbemitter @types/react-redux',
      { stdio: 'pipe' },
    )
  }
);

module.exports = {
  name: 'typescript',
  promptsOptions,
  apply,
}
