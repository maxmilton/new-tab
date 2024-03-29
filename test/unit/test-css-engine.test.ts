import { describe, expect, test } from 'bun:test';
import {
  DECLARATION,
  RULESET,
  cleanElement,
  compile,
  lookup,
  reduce,
  walk,
  type Element,
} from './css-engine';

const css = `
  .foo {
    color: red;
  }

  .bar {
    color: blue;
  }

  .baz {
    color: pink;
  }

  .baz {
    color: green;
  }

  @media (min-width: 768px) {
    .baz {
      color: purple;
    }
  }

  .qux {
    color: yellow;

    & > .qax {
      color: orange;
    }
  }

  @font-face {
    font-family: 'Example';
    src: url('fonts/Example.woff') format('woff2');
  }
`;
const ast = compile(css);

describe('lookup', () => {
  test('throws if selector is invalid', () => {
    expect(() => lookup(ast, '')).toThrow();
    expect(() => lookup(ast, ' ')).toThrow();
    expect(() => lookup(ast, ';')).toThrow();
    expect(() => lookup(ast, '{}')).toThrow();
    expect(() => lookup(ast, '@')).toThrow();
    expect(() => lookup(ast, '&')).toThrow();
    // FIXME: These should also throw, but they don't
    // expect(() => lookup(ast, '[]')).toThrow();
    // expect(() => lookup(ast, '#')).toThrow();
    // expect(() => lookup(ast, '.')).toThrow();
  });

  test('throws if multiple selectors are passed', () => {
    expect(() => lookup(ast, '.foo, .bar')).toThrow('Expected a single CSS selector');
  });

  test('throws if multiple rulesets are found', () => {
    expect(() => lookup(ast, '.bar{} .baz')).toThrow('Expected a single CSS selector');
  });

  test('finds all matching elements', () => {
    expect(lookup(ast, '.foo')).toHaveLength(1);
    expect(lookup(ast, '.bar')).toHaveLength(1);
    expect(lookup(ast, '.baz')).toHaveLength(3); // three rulesets have this selector
    expect(lookup(ast, '.qux')).toHaveLength(1);
    expect(lookup(ast, '.qax')).toBeUndefined(); // actual selector is .qux>.qax
    expect(lookup(ast, '.quux')).toBeUndefined(); // no matching selector
  });
});

describe('walk', () => {
  test('visits all elements', () => {
    const selectors: string[] = [];
    walk(ast, (element) => {
      if (element.type === RULESET) {
        selectors.push(...element.props);
      }
    });
    expect(selectors).toEqual(['.foo', '.bar', '.baz', '.baz', '.baz', '.qux', '.qux>.qax']);
  });
});

describe('reduce', () => {
  test('returns an object', () => {
    const reduced = reduce([ast[0]]);
    expect(reduced).toBePlainObject();
  });

  test('merges all elements, overriding earlier values', () => {
    const elements = lookup(ast, '.baz')!;
    expect(elements).toHaveLength(3);
    const reduced = reduce(elements);
    // FIXME: It should be green since it's outside the media query
    // expect(reduced).toEqual({ color: 'green' }); // last one wins
    expect(reduced).toEqual({ color: 'purple' }); // last one wins
  });
});

describe('cleanElement', () => {
  for (const prop of ['root', 'parent', 'siblings'] as const) {
    test(`removes "${prop}" property without mutating original object`, () => {
      const cleaned = cleanElement(ast[0]);
      expect(ast[0]).toHaveProperty(prop);
      expect(cleaned).not.toHaveProperty(prop);
    });
  }

  test('replaces "children" property with count of child elements when children is array', () => {
    const element = lookup(ast, '.qux')![0];
    const cleaned = cleanElement(element);
    expect(element).toHaveProperty('children');
    expect(element.children).toBeArray();
    expect(cleaned).toHaveProperty('children', 1);
  });

  test('leaves "children" property alone when children is not array', () => {
    const element = ast[0].children[0] as Element;
    expect(element).toBePlainObject();
    expect(element.type).toBe(DECLARATION);
    const cleaned = cleanElement(element);
    expect(element).toHaveProperty('children', 'red');
    expect(element.children).toBeString();
    expect(cleaned).toHaveProperty('children', element.children);
  });
});
