import App from './App.html';

const target = document.body;

// clear static html content
target.innerHTML = '';

export default new App({
  target,
});
