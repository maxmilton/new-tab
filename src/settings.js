const settings = require('./components/settings');

settings
  .renderSync()
  .replace(document.getElementById('settings'));
