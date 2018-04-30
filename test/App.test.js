import App from '../src/App.html';

// FIXME: Remove this; just a check to make sure tests are working!
test('placeholder to pass', () => {
  expect(2 + 3).toEqual(5);
});

describe('App root component', () => {
  it('should render', () => {
    const target = document.createElement('div');
    new App({ target });
    expect(target.textContent).toBe('Hello App!');
  });
});
