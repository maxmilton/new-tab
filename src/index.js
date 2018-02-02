/**
 * Chrome New Tab
 * @overview A minimal and high performance Google Chrome new tab page (NTP) extension.
 * @author Max Milton <max@wearegenki.com>
 */

const app = require('./components/ntp');
const { onClick } = require('./helpers');

app
  .renderSync({
    $global: {
      onClick,
    },
  })
  .replace(document.getElementById('ntp'));
