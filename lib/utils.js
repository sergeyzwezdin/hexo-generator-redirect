const { path } = require('sbg-utility');

/**
 * clean dirname for logs
 * @param {string} paths
 * @returns
 */
function cleanCwd(paths) {
  return paths.replace(path.join(__dirname, '..'), '');
}

module.exports = { cleanCwd };
