'use strict';

const chrome = require('sinon-chrome');

// set up Chrome API mocks
global.chrome = chrome;

// simple OffscreenCanvas mock
global.OffscreenCanvas = jest.fn(() => ({
  getContext: () => ({
    font: '',
    measureText: () => ({
      width: '',
    }),
  }),
}));
