import App from './App.html';

const target = document.body;

// clear static html content
// TODO: Try to use hydration instead
target.innerHTML = '';

export default new App({
  target,
  // hydrate: true,
});
