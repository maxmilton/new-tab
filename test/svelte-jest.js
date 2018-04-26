const svelte = require('svelte');
// const postcssLoadConfig = require('postcss-load-config');
// const postcss = require('postcss');

function process(src, filename) {
  // const normalized = svelte.preprocess(src, {
  //   style: ({ content, filepath }) =>
  //     postcssLoadConfig({}).then(({ plugins }) =>
  //       postcss(plugins)
  //         .process(content, {
  //           from: filepath,
  //           to: filepath,
  //         })
  //         .then(result => ({
  //           code: result.css,
  //           map: result.map,
  //         }))
  //     ), // eslint-disable-line function-paren-newline
  // });

  // console.log('@!@!', normalized.toString());

  // const result = svelte.compile(normalized.toString(), {
  const result = svelte.compile(src, {
    // css: false,
    format: 'cjs',
    filename,
    onwarn(warning, onwarn) {
      if (!/A11y:/.test(warning.message)) {
        onwarn(warning);
      }
    },
  });

  return {
    code: result.code,
    map: result.map,
  };
}

module.exports = {
  process,
};
