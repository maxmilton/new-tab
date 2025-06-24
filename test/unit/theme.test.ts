/* eslint-disable consistent-return */

import { afterEach, describe, expect, test } from 'bun:test';
import {
  compile,
  DECLARATION,
  type Element,
  isHexColor,
  isLightOrDark,
  RULESET,
  SKIP,
  walk,
} from '@maxmilton/test-utils/css';
import themes from '../../dist/themes.json' with { type: 'json' };
import type { UserStorageData } from '../../src/types.ts';
import { reset } from '../setup.ts';

const themeNames = [
  'auto',
  'black',
  'dark',
  'hacker-blue',
  'hacker-pink',
  'hacker-terminal',
  'light',
  'neon-dreams',
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
    expect.assertions(1);
    // oxlint-disable-next-line unicorn/prefer-structured-clone
    expect(JSON.parse(JSON.stringify(themes))).toEqual(themes);
  });

  test('contains all themes and no unexpected themes', () => {
    expect.assertions(1);
    expect(Object.keys(themes) as readonly string[]).toEqual(themeNames);
  });
});

for (const theme of themeNames) {
  describe(`theme: ${theme}`, () => {
    const css = themes[theme];
    const ast = compile(css);

    test('is within expected size limits', () => {
      expect.assertions(2);
      expect(css.length).toBeGreaterThan(80);
      expect(css.length).toBeLessThan(1500);
    });

    // TODO: More elegant way to test auto theme?
    if (theme === 'auto') {
      test('contains exactly one @media query', () => {
        expect.assertions(1);
        expect(css).toIncludeRepeated('@media', 1);
      });

      test('@media query checks prefers-color-scheme is dark', () => {
        expect.assertions(1);
        expect(css).toInclude('@media (prefers-color-scheme:dark)');
      });
    } else {
      test('does not contain any @media queries', () => {
        expect.assertions(1);
        expect(css).not.toInclude('@media');
      });
    }

    test('does not contain any @font-face rules', () => {
      expect.assertions(1);
      expect(css).not.toInclude('@font-face');
    });

    test('does not contain any @import rules', () => {
      expect.assertions(1);
      expect(css).not.toInclude('@import');
    });

    test('does not contain any comments', () => {
      expect.assertions(4);
      expect(css).not.toInclude('/*');
      expect(css).not.toInclude('*/');
      expect(css).not.toInclude('//'); // inline comments or URL protocol
      expect(css).not.toInclude('<!');
    });

    test('compiled AST is not empty', () => {
      expect.assertions(2);
      expect(ast).toBeArray();
      expect(ast).not.toBeEmpty();
    });

    // TODO: More elegant way to test auto theme?
    if (theme === 'auto') {
      test('has two :root{} which each contains all expected CSS variables', () => {
        expect.assertions(2);
        let found = 0;
        const variables: string[][] = [];
        walk(ast, (element) => {
          if (element.type !== RULESET) return; // continue
          if (element.value !== ':root') return SKIP;
          found += 1;
          const variables2: string[] = [];
          for (const child of element.children as Element[]) {
            if (child.type === DECLARATION) {
              if ((child.props as string).startsWith('--') && child.children) {
                variables2.push(child.props as string);
              }
            } else {
              throw new Error(`Unexpected child element type: ${child.type}`);
            }
          }
          variables.push(variables2);
          return SKIP; // we manually iterated over the children
        });
        expect(found).toBe(2);
        // @ts-expect-error - TODO: Fix type comparison of string[] to readonly string[].
        expect(variables).toEqual([cssVariables, cssVariables]);
      });
    } else {
      test('has single :root{} which contains all expected CSS variables', () => {
        expect.assertions(2);
        let found = 0;
        const variables: string[] = [];
        walk(ast, (element) => {
          if (element.type !== RULESET) return; // continue
          if (element.value !== ':root') return SKIP;
          found += 1;
          for (const child of element.children as Element[]) {
            if (child.type === DECLARATION) {
              if ((child.props as string).startsWith('--') && child.children) {
                variables.push(child.props as string);
              }
            } else {
              throw new Error(`Unexpected child element type: ${child.type}`);
            }
          }
          return SKIP; // we manually iterated over the children
        });
        expect(found).toBe(1);
        // @ts-expect-error - TODO: Fix type comparison of string[] to readonly string[].
        expect(variables).toEqual(cssVariables);
      });
    }
  });
}

const MODULE_PATH_THEME = Bun.resolveSync('./src/theme.ts', '.');
const MODULE_PATH_UTILS = Bun.resolveSync('./src/utils.ts', '.');
let newtabCSS: string | undefined;

async function load(themeName?: (typeof themeNames)[number]) {
  // mock user settings
  chrome.storage.local.get = () =>
    Promise.resolve({
      n: themeName ?? 'auto',
      t: themes[themeName ?? 'auto'],
    } satisfies UserStorageData);

  // inject newtab.css
  const style = window.document.createElement('style');
  // oxlint-disable-next-line no-multi-assign
  style.textContent = newtabCSS ??= await Bun.file('dist/newtab.css').text();
  window.document.head.appendChild(style);

  Loader.registry.delete(MODULE_PATH_THEME);
  Loader.registry.delete(MODULE_PATH_UTILS);
  await import(MODULE_PATH_THEME); // no exports; just side effects
  await happyDOM.waitUntilComplete();
}

describe('theme loader', () => {
  // Completely reset DOM and global state between tests
  afterEach(reset);

  test('loads expected style sheets', async () => {
    expect.assertions(2);
    await load();
    expect(document.styleSheets).toHaveLength(1); // injected in load() above
    expect(document.adoptedStyleSheets).toHaveLength(1); // from src/theme.ts
  });

  test('loads auto theme by default', async () => {
    expect.assertions(5);
    await load();

    // const rootStyles = window.getComputedStyle(document.documentElement);
    // const styles = window.getComputedStyle(document.body);
    // expect(rootStyles.colorScheme).toBe('dark');
    // expect(rootStyles.getPropertyValue('--b')).toBe('#23252d');
    // expect(styles.backgroundColor).toBe('#23252d');
    // expect(isHexColor(styles.backgroundColor)).toBeTrue();
    // expect(isLightOrDark(styles.backgroundColor)).toBe('dark');

    const rootStyles = window.getComputedStyle(document.documentElement);
    const styles = window.getComputedStyle(document.body);
    // TODO: Spec default value for colorScheme is 'normal' but happy-dom uses an empty string.
    // expect(rootStyles.colorScheme).toBe('normal');
    expect(rootStyles.colorScheme).toBe('');
    expect(rootStyles.getPropertyValue('--b')).toBe('#fafafa');
    expect(styles.backgroundColor).toBe('#fafafa');
    expect(isHexColor(styles.backgroundColor)).toBeTrue();
    expect(isLightOrDark(styles.backgroundColor)).toBe('light');

    // TODO: Use this once happy-dom supports proper CSS inheritance.
    // const styles = window.getComputedStyle(document.body);
    // expect(styles.colorScheme).toBe('dark');
    // expect(styles.getPropertyValue('--b')).toBe('#23252d');
    // expect(styles.backgroundColor).toBe('#23252d');
    // expect(isHexColor(styles.backgroundColor)).toBeTrue();
    // expect(isLightOrDark(styles.backgroundColor)).toBe('dark');
  });
});
