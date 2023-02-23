const fs = require('fs-extra');
const path = require('upath');
const ansiColors = require('ansi-colors');
const logname = ansiColors.magentaBright('[hexo-generator-redirect]');
const cwd = path.toUnix(process.cwd());

/**
 * configure generator
 * @param {import('hexo')} hexo
 * @returns
 */
function configure(hexo) {
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
    const layoutLocation = ['.njk', '.pug', '.ejs', '.jsx', 'swig', '.tsx']
      .map((ext) => ['_layout' + ext, 'layout' + ext])
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
            hexo.log.info(logname, 'cannot copy', cleanCwd(sourceRedirectLayout), cleanCwd(themeRedirectLayoutPath));
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

/**
 * Core Lib
 * @param {import('hexo')} hexo
 * @returns
 */
const generator = (hexo) => {
  const { layoutName } = configure(hexo);
  return ({ posts, pages }) => {
    return [
      ...posts
        // fix if redirect_from is string
        .map((page) => {
          if (typeof page.redirect_from === 'string') {
            page.redirect_from = [page.redirect_from];
          }
          return page;
        })

        .filter(({ redirect_from }) => redirect_from && Array.isArray(redirect_from) && redirect_from.length > 0)

        .map((page) => page.redirect_from.map((redirect) => ({ redirect, page })))

        .reduce((result, current) => [...result, ...current], []),

      ...pages
        // fix if redirect_from is string
        .map((page) => {
          if (typeof page.redirect_from === 'string') {
            page.redirect_from = [page.redirect_from];
          }
          return page;
        })
        .filter(({ redirect_from }) => redirect_from && Array.isArray(redirect_from) && redirect_from.length > 0)

        .map((page) => page.redirect_from.map((redirect) => ({ redirect, page })))

        .reduce((result, current) => [...result, ...current], [])
    ].map(
      /**
       *
       * @param {{redirect:string}} param0
       * @returns
       */
      ({ redirect, page }) => {
        const path = redirect.endsWith('.html') ? redirect : `${redirect}/index.html`;
        if (fs.existsSync(path)) fs.rmSync(path);

        // assign metadata layout

        page.layout = layoutName;

        //console.log(path);
        return {
          path,

          // merge original page information data with new properties
          /*data: Object.assign(page, {
            target: page,
            redirect_to: page.url,
            redirect_from: redirect,
            layout
          }),*/

          data: {
            target: page,
            title: page.title,
            redirect_to: page.url,
            redirect_from: redirect,
            layout: layoutName
          },

          layout: layoutName
        };
      }
    );
  };
};

module.exports = generator;
module.exports = { configure, generator };

/**
 * clean dirname for logs
 * @param {string} paths
 * @returns
 */
function cleanCwd(paths) {
  return paths.replace(paths, '').replace(path.join(__dirname, '..'), '');
}
