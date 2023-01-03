/* global hexo */

const fs = require('fs');
const { join, toUnix } = require('upath');
const ansiColors = require('ansi-colors');
const logname = ansiColors.magentaBright('[hexo-generator-redirect]');
const cwd = toUnix(process.cwd());

/**
 * Core Lib
 * @param {import('hexo')} hexo
 * @returns
 */
const generator = (hexo) => {
  return ({ posts, pages }) => {
    // determine layout location
    const baseLayoutDefault = join(__dirname, '../template');
    // determine theme location
    let themeLocation = join(cwd, 'themes', hexo.config.theme);
    if (!fs.existsSync(themeLocation)) {
      themeLocation = join(
        cwd,
        'node_modules',
        'hexo-theme-' + hexo.config.theme
      );
    }

    /**
     * define layout default from config
     * @type {string}
     */
    let layoutName = hexo.config.redirect.layout || 'hexo-generator-redirect'; // redirect layout name

    if (fs.existsSync(themeLocation)) {
      const layoutLocation = ['.njk', '.pug', '.ejs', '.jsx', 'swig', '.tsx']
        .map((ext) => ['_layout' + ext, 'layout' + ext])
        .map((files) =>
          files.map((file) => join(themeLocation, 'layout', file))
        );
      // filter layout theme extension
      layoutLocation
        .map((paths) => paths.filter((path) => fs.existsSync(path)))
        .forEach((paths) => {
          const themeLayoutPath = paths[0];
          if (!fs.existsSync(themeLayoutPath)) return;
          const split = themeLayoutPath.split('.');
          const ext = split[split.length - 1];

          // add extension layout
          if (!layoutName.includes('.')) {
            // if (ext === 'njk')
            layoutName = layoutName + '.' + ext;
          }

          const redirectLayoutPath = join(themeLocation, 'layout', layoutName);
          const defaultRedirectLayout = join(baseLayoutDefault, layoutName);
          hexo.log.debug({
            themeLayoutPath,
            redirectLayoutPath,
            defaultRedirectLayout
          });

          // copy redirect layout to theme folder
          if (
            (!fs.existsSync(redirectLayoutPath) &&
              fs.existsSync(defaultRedirectLayout)) ||
            process.argv.slice(2).includes('--dev')
          ) {
            fs.copyFile(defaultRedirectLayout, redirectLayoutPath, (err) => {
              if (err) throw err;
              console.log(
                logname,
                ansiColors.redBright(
                  defaultRedirectLayout
                    .replace(cwd, '')
                    .replace(join(__dirname, '..'), '')
                ) +
                  ansiColors.yellowBright(' was copied to ') +
                  ansiColors.greenBright(redirectLayoutPath.replace(cwd, ''))
              );
            });
          }
        });
    }

    return [
      ...posts
        // fix if redirect_from is string
        .map((page) => {
          if (typeof page.redirect_from === 'string') {
            page.redirect_from = [page.redirect_from];
          }
          return page;
        })

        .filter(
          ({ redirect_from }) =>
            redirect_from &&
            Array.isArray(redirect_from) &&
            redirect_from.length > 0
        )

        .map((page) =>
          page.redirect_from.map((redirect) => ({ redirect, page }))
        )

        .reduce((result, current) => [...result, ...current], []),

      ...pages
        // fix if redirect_from is string
        .map((page) => {
          if (typeof page.redirect_from === 'string') {
            page.redirect_from = [page.redirect_from];
          }
          return page;
        })
        .filter(
          ({ redirect_from }) =>
            redirect_from &&
            Array.isArray(redirect_from) &&
            redirect_from.length > 0
        )

        .map((page) =>
          page.redirect_from.map((redirect) => ({ redirect, page }))
        )

        .reduce((result, current) => [...result, ...current], [])
    ].map(
      /**
       *
       * @param {{redirect:string}} param0
       * @returns
       */
      ({ redirect, page }) => {
        const path = redirect.endsWith('.html')
          ? redirect
          : `${redirect}/index.html`;
        if (fs.existsSync(path)) fs.rmSync(path);

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
