/* eslint-env jest */

import chromeMocks from 'sinon-chrome';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/interface-name-prefix
    interface Global {
      chrome: typeof chrome;
      OffscreenCanvas: OffscreenCanvas;
    }
  }
}

// set up Chrome API mocks
// @ts-ignore
global.chrome = chromeMocks;

// simple OffscreenCanvas mock
// @ts-ignore
global.OffscreenCanvas = jest.fn(() => ({
  getContext: () => ({
    font: '',
    measureText: () => ({
      width: '',
    }),
  }),
}));
