const { path, fs } = require('sbg-utility');
const ansiColors = require('ansi-colors');
const { cleanCwd } = require('./utils');
const logname = ansiColors.magentaBright('hexo-generator-redirect');
const cwd = path.toUnix(process.cwd());

/**
 * configure generator
 * @param {import('hexo')} hexo
 * @returns
 */
function configure(hexo) {
  hexo.log.i('configuring hexo-generator-redirect');
  // determine layout location
  const baseLayoutDefault = path.join(__dirname, '../template');
  /**
   * default layout from template folder
   */
  let sourceRedirectLayout = path.join(baseLayoutDefault, 'hexo-generator-redirect.njk');
  // determine theme location
  let themeLocation = path.join(cwd, 'themes', hexo.config.theme);
  if (!fs.existsSync(themeLocation)) {
    themeLocation = path.join(cwd, 'node_modules', 'hexo-theme-' + hexo.config.theme);
  }

  /**
   * define layout default from config
   * @type {string|undefined}
   */
  let layoutName = hexo.config.redirect.layout; // redirect layout name

  hexo.log.debug(logname, { themeLocation, layoutName });
  // copy default layout to theme layout
  if (fs.existsSync(themeLocation)) {
    // detect engine used by theme
    const layoutLocation = ['.njk', '.pug', '.ejs', '.jsx', 'swig', '.tsx']
      .map((ext) => ['_layout' + ext, 'layout' + ext, 'post' + ext, 'page' + ext])
      .map((files) => files.map((file) => path.join(themeLocation, 'layout', file)));
    // filter layout theme extension
    layoutLocation
      .map((paths) => paths.filter((path) => fs.existsSync(path)))
      .forEach((paths) => {
        const themeLayoutPath = paths[0];
        if (!themeLayoutPath) return;
        if (!fs.existsSync(themeLayoutPath)) {
          hexo.log.error(logname, themeLayoutPath, 'not found');
          return;
        }
        const themeLayoutSplit = path.basename(themeLayoutPath).split('.');
        const themeLayoutExt = themeLayoutSplit[themeLayoutSplit.length - 1];

        const sourceLayoutSplit = path.basename(sourceRedirectLayout).split('.');
        const sourceLayoutExt = sourceLayoutSplit[sourceLayoutSplit.length - 1];

        layoutName = path.basename(sourceRedirectLayout).replace('.' + sourceLayoutExt, '') + '.' + themeLayoutExt;
        sourceRedirectLayout = path.join(path.dirname(sourceRedirectLayout), layoutName);

        const themeRedirectLayoutPath = path.join(themeLocation, 'layout', layoutName);

        hexo.log.debug(logname, {
          themeLayoutSplit,
          themeLayoutExt,
          sourceLayoutSplit,
          sourceLayoutExt,
          themeLayoutPath,
          themeRedirectLayoutPath,
          sourceRedirectLayout
        });

        // copy redirect layout to theme folder when not exist inside theme layout directory
        if (
          (!fs.existsSync(themeRedirectLayoutPath) && fs.existsSync(sourceRedirectLayout)) ||
          process.argv.slice(2).includes('--dev')
        ) {
          try {
            fs.copyFileSync(sourceRedirectLayout, themeRedirectLayoutPath);
            hexo.log.log(
              logname,
              ansiColors.redBright(cleanCwd(sourceRedirectLayout)),
              ansiColors.yellowBright('copied to'),
              ansiColors.greenBright(cleanCwd(themeRedirectLayoutPath))
            );
          } catch {
            hexo.log.error(logname, 'cannot copy', cleanCwd(sourceRedirectLayout), cleanCwd(themeRedirectLayoutPath));
          }
        }
      });
  }

  return {
    layoutName,
    defaultRedirectLayout: sourceRedirectLayout,
    baseLayoutDefault,
    themeLocation
  };
}

module.exports = { configure };
