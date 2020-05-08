hexo.config.redirect = Object.assign(
    {
        enable: true,
        layout: 'redirect'
    },
    hexo.config.redirect
);

if (hexo.config.redirect.enable) {
    hexo.extend.generator.register('redirect', require('./lib/generator')(hexo));
}
