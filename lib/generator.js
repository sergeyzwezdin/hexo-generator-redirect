const generator = (hexo) => ({ posts, pages }) =>
    [
        ...posts
            .filter(({ redirect_from }) => redirect_from && Array.isArray(redirect_from) && redirect_from.length > 0)
            .map((page) => page.redirect_from.map((redirect) => ({ redirect, page })))
            .reduce((result, current) => [...result, ...current], []),
        ...pages
            .filter(({ redirect_from }) => redirect_from && Array.isArray(redirect_from) && redirect_from.length > 0)
            .map((page) => page.redirect_from.map((redirect) => ({ redirect, page })))
            .reduce((result, current) => [...result, ...current], [])
    ].map(({ redirect, page }) => ({
        path: `${redirect}/index.html`,
        data: { target: page, redirect_from: redirect, layout: hexo.config.redirect.layout },
        layout: hexo.config.redirect.layout
    }));

module.exports = generator;
