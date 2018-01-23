// https://eslint.org/docs/user-guide/configuring

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  env: {
    es6: true,
    browser: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
  ],
  settings: {
    'import/resolver': {
      node: { extensions: ['.marko', '.js'] }
    },
  },
  rules: {
    'import/extensions': ['error', 'always', {
      js: 'never',
      marko: 'never',
    }],
    'import/no-extraneous-dependencies': ['error', {
      optionalDependencies: ['test/unit/index.js'],
    }],
    'no-debugger': isProduction ? 'error' : 'off',
    'object-curly-spacing': ['error', 'always', { objectsInObjects: false }],
    'object-curly-newline': ['error', { consistent: true }],
  },
};
