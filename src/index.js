const app = require('./components/app');

app
  .renderSync()
  .replace(document.getElementById('app'));
