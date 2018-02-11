/**
 * New Tab
 * @overview A high performance new tab page that gets you where you need to go faster.
 * @author Max Milton <max@wearegenki.com>
 */

const ntp = require('./components/ntp');

ntp
  .renderSync()
  .replace(document.getElementById('ntp'));
