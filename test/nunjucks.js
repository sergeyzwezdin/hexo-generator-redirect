const { readFileSync } = require('fs-extra');
const nunjucks = require('nunjucks');
const { joinPath } = require('sbg-utility');
const env = new nunjucks.Environment();

env.addFilter('uriencode', (str) => {
  return encodeURI(str);
});

env.addFilter('noControlChars', (str) => {
  return str.replace(/[\x00-\x1F\x7F]/g, ''); // eslint-disable-line no-control-regex
});

env.addGlobal('full_url_for', (str) => {
  const url = new URL('http://example.net');
  url.pathname = str;
  return url.toString();
});

const atomTmplSrc = joinPath(__dirname, '../template/hexo-generator-redirect.njk');
const atomTmpl = nunjucks.compile(readFileSync(atomTmplSrc, 'utf8'), env);
const redirect_to = atomTmpl.render({
  config: {
    title: 'site title'
  },
  page: {
    redirect_to: '/test/redirect/to'
  },
  title: 'sample title'
});
console.log(redirect_to.includes(`location.replace('http://example.net/test/redirect/to')`));
