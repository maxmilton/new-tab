import chromeMocks from 'sinon-chrome';

// set up Chrome API mocks
global.chrome = chromeMocks;

// simple OffscreenCanvas mock
global.OffscreenCanvas = jest.fn(() => ({
  getContext: () => ({
    font: '',
    measureText: () => ({
      width: '',
    }),
  }),
}));
