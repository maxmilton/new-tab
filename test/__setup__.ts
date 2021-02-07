export {};

/**
 * Chrome web extension mocks.
 * No good packages exist so we need to mock this API ourselves.
 *
 * @see https://developers.chrome.com/apps/api_index
 * @see https://developers.chrome.com/extensions/devguide
 */
const chromeMock = {
  bookmarks: {
    getTree: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  tabs: {
    onMoved: {
      addListener: jest.fn(),
    },
    onRemoved: {
      addListener: jest.fn(),
    },
    onUpdated: {
      addListener: jest.fn(),
    },
    query: jest.fn(),
  },
  topSites: {
    get: jest.fn(),
  },
};

// @ts-expect-error
global.chrome = chromeMock;
