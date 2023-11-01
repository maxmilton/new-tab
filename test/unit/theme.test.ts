/* eslint-disable consistent-return */

import { afterEach, describe, expect, test } from 'bun:test';
import themes from '../../dist/themes.json';
import type { UserStorageData } from '../../src/types';
import { reset } from '../setup';
import { DECLARATION, RULESET, SKIP, compile, walk, type Element } from './css-engine';

const themeNames = [
  'dark',
  'hacker-terminal',
  'light',
  'neon-dreams',
  'rich-black',
  'tilde-club',
] as const;

const cssVariables = [
  '--s', // shadow
  '--b', // background
  '--t', // text
  '--c1', // bookmark node hover background, hr, button border, search input border
  '--c2', // bookmarks bar, menu dropdown, "load more" button
  '--c3', // icons, empty folder text, text fallback (headings, etc.)
] as const;

describe('themes.json', () => {
  test('is valid JSON', () => {
    expect(JSON.parse(JSON.stringify(themes))).toEqual(themes);
  });

  test('contains all themes', () => {
    // @ts-expect-error - TODO: Fix type comparision of string[] to readonly string[].
    expect(Object.keys(themes)).toEqual(themeNames);
  });
});

for (const theme of themeNames) {
  describe(`theme: ${theme}`, () => {
    const css = themes[theme];
    const ast = compile(css);

    test('is within expected size limits', () => {
      expect(css.length).toBeGreaterThan(80);
      expect(css.length).toBeLessThan(1500);
    });

    test('does not contain any @media queries', () => {
      expect(css).not.toInclude('@media');
    });

    test('does not contain any @font-face rules', () => {
      expect(css).not.toInclude('@font-face');
    });

    test('does not contain any @import rules', () => {
      expect(css).not.toInclude('@import');
    });

    test('does not contain any comments', () => {
      expect(css).not.toInclude('/*');
      expect(css).not.toInclude('*/');
      expect(css).not.toInclude('//');
      expect(css).not.toInclude('<!');
    });

    test('compiled AST is not empty', () => {
      expect(ast).not.toBeEmpty();
    });

    test('has single :root{} which contains all expected CSS variables', () => {
      let found = 0;
      const variables: string[] = [];
      walk(ast, (element) => {
        if (element.type !== RULESET || element.value !== ':root') return SKIP;
        found += 1;
        (element.children as Element[]).forEach((child) => {
          if (child.type === DECLARATION) {
            if ((child.props as string).startsWith('--') && child.children) {
              variables.push(child.props as string);
            }
          } else {
            throw new Error('Unexpected child element type: ' + child.type);
          }
        });
      });
      expect(found).toBe(1);
      // @ts-expect-error - TODO: Fix type comparision of string[] to readonly string[].
      expect(variables).toEqual(cssVariables);
    });
  });
}

const MODULE_PATH_THEME = import.meta.resolveSync('../../src/theme.ts');
const MODULE_PATH_UTILS = import.meta.resolveSync('../../src/utils.ts');
let newtabCSS: string | undefined;

async function load(themeName?: (typeof themeNames)[number]) {
  // mock user settings
  global.chrome.storage.local.get = () =>
    Promise.resolve({
      tn: themeName ?? 'dark',
      t: themes[themeName ?? 'dark'],
    } satisfies UserStorageData);

  // inject newtab.css
  const style = window.document.createElement('style');
  // eslint-disable-next-line no-multi-assign
  style.textContent = newtabCSS ??= await Bun.file('dist/newtab.css').text();
  window.document.head.appendChild(style);

  Loader.registry.delete(MODULE_PATH_THEME);
  Loader.registry.delete(MODULE_PATH_UTILS);
  await import(MODULE_PATH_THEME);
  await happyDOM.whenAsyncComplete();

  // FIXME: Remove this once happy-dom supports adoptedStyleSheets correctly.
  document.adoptedStyleSheets.forEach((sheet) => {
    const adoptedStyle = window.document.createElement('style');
    // @ts-expect-error - _currentText is an internal implementation detail of happy-dom
    adoptedStyle.textContent = sheet._currentText as string;
    window.document.head.appendChild(adoptedStyle);
  });
}

describe('theme loader', () => {
  // Completely reset DOM and global state between tests
  afterEach(reset);

  test('loads dark theme by default', async () => {
    await load();
    // expect(document.styleSheets).toHaveLength(1); // FIXME: Uncomment once adoptedStyleSheets issue is fixed.
    expect(document.adoptedStyleSheets).toHaveLength(1);

    // FIXME: Remove this and just use bodyStyles; see below.
    const htmlStyles = window.getComputedStyle(document.documentElement);
    expect(htmlStyles.colorScheme).toBe('dark');
    // expect(htmlStyles.getPropertyValue('color-scheme')).toBe('dark');

    const bodyStyles = window.getComputedStyle(document.body);
    // FIXME: Uncomment this once happy-dom supports proper CSS inheritance.
    // expect(bodyStyles.colorScheme).toBe('dark');
    expect(bodyStyles.getPropertyValue('--b')).toBe('#23252d');
  });
});
