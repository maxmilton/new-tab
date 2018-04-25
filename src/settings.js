import Settings from './Settings.html';

const target = document.body;

// clear static html content
target.innerHTML = '';

export default new Settings({
  target,
});
