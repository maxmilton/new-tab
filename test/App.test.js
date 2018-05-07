import chrome from 'sinon-chrome';
import App from '../src/App.html';

// set up chrome api mocks
global.chrome = chrome;

describe('App root component', () => {
  it('should render correctly', () => {
    const target = document.createElement('div');
    new App({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});
