/* global hexo */

const { configure } = require('./lib/configure');
const { generator } = require('./lib/generator');

if (typeof hexo !== 'undefined') {
  hexo.config.redirect = Object.assign(
    {
      enable: false,
      layout: 'hexo-generator-redirect'
    },
    hexo.config.redirect
  );

  if (hexo.config.redirect.enable) {
    // configuring enviroment
    configure(hexo);
    // apply on `hexo generate`
    hexo.extend.generator.register('hexo-generator-redirect', generator(hexo));
  }
} else {
  console.error('hexo-generator-redirect only for hexo plugin');
}
