export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : DeepPartial<T[P]>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      chrome: DeepPartial<typeof chrome>;
    }
  }
}

/**
 * Chrome web extension mocks.
 * No good packages exist so we need to mock this API ourselves.
 *
 * @see https://developers.chrome.com/apps/api_index
 * @see https://developers.chrome.com/extensions/devguide
 */
const chromeMock: DeepPartial<typeof chrome> = {
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

// @ts-expect-error - FIXME: `DeepPartial` is no longer viable here in newer TS
global.chrome = chromeMock;
