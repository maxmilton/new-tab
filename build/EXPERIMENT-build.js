require('marko/node-require').install({
  compilerOptions: {
    writeToDisk: false,
  },
});

const fs = require('fs');
const settings = require('../src/components/settings');

function cb(err) { if (err) throw err; }

settings.render({}, (err, result) => {
  if (err) throw err;

  // console.log('@@ FULL RESULT', result);
  // console.log('@@ RESULT', result.out);
  console.log('@@ TEMPLATE', result.out.global.template);
  console.log('@@ META', result.out.global.template.meta);

  const out = fs.createWriteStream('EXPERIMENT_settings.html');
  out.write(result.out.stream.str, {}, cb);

  // fs.writeFile('EXPERIMENT_settings.html', result.out.stream.str, cb);

  // const compiled = require('./EXPERIMENT_client.js');
  // console.log('@@ COMPILED', compiled);
  // fs.writeFile('EXPERIMENT_settings22.html', compiled, cb);

  // const marko = require('marko/components');
  // console.log('@@ COMPONENTS', marko);
  // marko.init();
  // let out2;
  // marko.writeInitComponentsCode(result.out, out2, true);
  // console.log('@@ OUT 22', out2);

  result.out.global.template.meta.deps.forEach((dep) => {
    //
  });
});

// =============================================================================

// const compile = require('@wearegenki/marko-compiler');
//
// const templatePath = require.resolve('../src/components/settings/index.marko');
//
// const result = compile({
//   entry: templatePath,
//   // out: __dirname,
//   // name: 'settings',
//   options: {},
// });
// console.log('@@ RESULT', result);
