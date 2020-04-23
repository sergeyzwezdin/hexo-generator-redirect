# hexo-generator-redirect ![Publish on NPM](https://github.com/sergeyzwezdin/hexo-generator-redirect/workflows/Publish%20on%20NPM/badge.svg?branch=master) ![](https://img.shields.io/npm/v/hexo-generator-redirect)

`hexo-generator-redirect` is a plugin for Hexo static site generator that generates additional redirect pages. It's useful if you migrate your website and changed addresses for some posts.

* Migrate to new URLs **without the pain**.
* **Easy to install** and use.
* **Custom templates** for the redirect page.

## How it works

The plugin generates additional HTML page for "outdated" URLs. These pages will contain information on where the page was moved to.

## Requirements
- Hexo: 4.x
- Node 12+

## Usage

1. Install the plugin using npm:
```bash
$ npm install hexo-generator-redirect --save-dev
```
2. Add `redirect_from` key into frontmatter of the page:
```yaml
layout: post
title: Page
redirect_from:
- /old-url1
- /old-url2
```
3. Create a layout template for the redirect page (for more details see below).
4. Build the website 🤝.

## Creating the template

Create `redirect.ejs` in the `layout` folder of your theme.

You can use the `post` variable in the template. To access the target page information, use `page.target.path`.

Here is an example of the redirect page layout (`redirect.ejs`):

```html
<% const newUrl = full_url_for(page.target.path) %>

<h1>Page address was changed</h1>
<p>The new page address is <a href="<%= newUrl %>"><%= newUrl %></a></p>

<script type="text/javascript">
  setTimeout(function(){ document.location.href = '<%= newUrl %>'; }, 5000);
</script>
```
