const fs = require('fs');
const { join, toUnix } = require('upath');
const chalk = require('chalk');
const logname = chalk.magentaBright('[hexo-generator-redirect]');
const cwd = toUnix(process.cwd());

/**
 * Core Lib
 * @param {import('hexo').Locals} hexo
 * @returns
 */
const generator = (hexo) => {
  return ({ posts, pages }) => {
    // determine layout
    const baseLayoutDefault = join(__dirname, '../template'); // /redirect.njk
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
    let layout = hexo.config.redirect.layout || 'redirect';
    if (fs.existsSync(themeLocation)) {
      ['.njk', '.pug', '.ejs', '.jsx', 'swig']
        .map((ext) => ['_layout' + ext, 'layout' + ext])
        .map((files) =>
          files.map((file) => join(themeLocation, 'layout', file))
        )
        // filter layout theme extension
        .map((paths) => paths.filter((path) => fs.existsSync(path)))
        .forEach((paths) => {
          const themeLayoutPath = paths[0];
          if (!fs.existsSync(themeLayoutPath)) return;
          //console.log({ themeLayoutPath });
          const split = themeLayoutPath.split('.');
          const ext = split[split.length - 1];
          // apply layout if null once
          if (!layout || !layout.includes('.')) {
            if (ext === 'njk') layout = 'redirect.' + ext;
          }
          const redirectLayoutPath = join(
            themeLocation,
            'layout',
            'redirect.' + ext
          );
          const defaultRedirectLayout = join(
            baseLayoutDefault,
            'redirect.' + ext
          );
          //console.log({ redirectLayoutPath, defaultRedirectLayout });
          if (
            (!fs.existsSync(redirectLayoutPath) &&
              fs.existsSync(defaultRedirectLayout)) ||
            process.argv.slice(2).includes('--dev')
          ) {
            fs.copyFile(defaultRedirectLayout, redirectLayoutPath, (err) => {
              if (err) throw err;
              console.log(
                logname,
                chalk.redBright(
                  defaultRedirectLayout
                    .replace(cwd, '')
                    .replace(join(__dirname, '..'), '')
                ) +
                  chalk.yellowBright(' was copied to ') +
                  chalk.greenBright(redirectLayoutPath.replace(cwd, ''))
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

        page.layout = layout;

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
            layout
          },

          layout
        };
      }
    );
  };
};

module.exports = generator;
