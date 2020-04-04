# hexo-generator-redirect

![Publish on NPM](https://github.com/sergeyzwezdin/hexo-generator-redirect/workflows/Publish%20on%20NPM/badge.svg?branch=master)

[Hexo](https://hexo.io/) plugin that generates additional redirect pages

## Requirements
- Hexo: 4.x
- Node 12+

## Installation

```bash
$ npm install hexo-generator-redirect --save-dev
```

## Usage

Add `redirect_from` key into frontmatter of the page:

```yaml
layout: post
title: Page
redirect_from:
- /old-url1
- /old-url2
```

Create layout template for the redirect page. Create `redirect.ejs` in `layout` folder of your theme.

You can use `post` variable in the template. To access the target page information, use `page.target.path`.

Here is an example of the redirect page layout (`redirect.ejs`):

```html
<% const newUrl = full_url_for(page.target.path) %>

<h1>Page address was changed</h1>
<p>The new page address is <a href="<%= newUrl %>"><%= newUrl %></a></p>

<script type="text/javascript">
  setTimeout(function(){ document.location.href = '<%= newUrl %>'; }, 5000);
</script>
```
