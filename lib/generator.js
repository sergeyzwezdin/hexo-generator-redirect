const fs = require('fs-extra');
const path = require('upath');
const ansiColors = require('ansi-colors');
const { configure } = require('./configure');
const logname = ansiColors.magentaBright('hexo-generator-redirect');
const cwd = path.toUnix(process.cwd());

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
module.exports = { generator };
