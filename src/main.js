import App from './App.html';

const target = document.body;

// clear static html content
// TODO: Try to use hydration instead
target.innerHTML = '';

const app = new App({
  target,
  // hydrate: true,
});

export default app;
