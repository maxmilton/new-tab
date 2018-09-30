// TODO: Probably put this into a new package + maybe put compileTemplate into another package too

/* eslint-disable import/no-extraneous-dependencies */

import { writeFile } from 'fs';
import path from 'path';
import { createFilter } from 'rollup-pluginutils';
import crass from 'crass';

const dev = !!process.env.ROLLUP_WATCH;

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} template A HTML template to compile.
 * @returns {Function}
 */
function compileTemplate(template) {
  return new Function('d', 'return `' + template + '`'); // eslint-disable-line
}

/**
 * Generate HTML from a template and write it to disk
 * @param {object} opts
 * @param {string} opts.file File path where to save generated HTML document.
 * @param {string} opts.template HTML document template.
 * @param {string=} opts.title Page title.
 * @param {string|Function} opts.content Page content.
 * @param {Array<string>=} opts.exclude Files to exclude from CSS processing.
 * @param {Array<string>=} opts.include Files to include in CSS processing.
 */
export default function makeHtml({
  file,
  template,
  title,
  content,
  exclude,
  include = ['**/*.css', '**/*.postcss', '**/*.pcss'],
  ...options
}) {
  const filter = createFilter(include, exclude);
  const injectHtml = compileTemplate(template);
  const styles = {};

  return {
    name: 'makeHtml',
    transform(source, id) {
      if (!filter(id)) return null;

      styles[id] = source;

      return '';
    },
    async generateBundle() {
      // combine all style sheets
      let css = '';
      for (const id in styles) { // eslint-disable-line
        css += styles[id] || '';
      }

      // minify CSS
      if (!dev && css.length) {
        css = crass.parse(css).optimize({ o1: true }).toString();
      }

      // compile HTML from template
      let body = typeof content === 'function'
        ? await content()
        : content;
      body = body.replace('%CSS%', css.length ? `<style>${css}</style>` : '');

      writeFile(path.join(__dirname, file), injectHtml({
        title,
        content: body,
        ...options,
      }).trim(), catchErr);
    },
  };
}
