/* global hexo */

const generator = require('./lib/generator');

if (typeof hexo !== 'undefined') {
  hexo.config.redirect = Object.assign(
    {
      enable: false,
      layout: 'hexo-generator-redirect'
    },
    hexo.config.redirect
  );

  if (hexo.config.redirect.enable) {
    hexo.extend.generator.register('hexo-generator-redirect', generator(hexo));
  }
} else {
  console.log('hexo-generator-redirect only for hexo plugin');
}
