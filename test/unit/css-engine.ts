/**
 * @overview CSS engine and utilities for writing CSS tests.
 */

/* eslint-disable import/no-extraneous-dependencies */

import { DECLARATION, MEDIA, RULESET, compile, type Element } from 'stylis';

export * from 'stylis';

export const SKIP = Symbol('SKIP');

/**
 * Clones the element, stripping out references to other elements (e.g.,
 * "parent") for cleaner logging. **Intended for debugging only.**
 */
export const cleanElement = <T extends Element>(element: T): T => ({
  ...element,
  root: undefined,
  parent: undefined,
  children: Array.isArray(element.children)
    ? element.children.length
    : element.children,
  siblings: undefined,
});

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type VisitorFunction = (element: Element) => typeof SKIP | void;

function visit(element: Element, visitor: VisitorFunction): void {
  if (visitor(element) === SKIP) return;
  if (Array.isArray(element.children)) {
    for (const child of element.children) {
      visit(child, visitor);
    }
  }
}

/**
 * Walks the AST and calls the visitor function for each element.
 */
export function walk(root: Element[], visitor: VisitorFunction): void {
  for (const element of root) {
    visit(element, visitor);
  }
}

const cache = new WeakMap<Element[], Map<string, Element[]>>();

function load(root: Element[]): void {
  const map = new Map<string, Element[]>();
  cache.set(root, map);

  walk(root, (element) => {
    if (element.type[0] === '@') {
      return element.type === MEDIA ? undefined : SKIP;
    }

    if (element.type === RULESET) {
      for (const selector of element.props) {
        if (map.has(selector)) {
          map.get(selector)!.push(element);
        } else {
          map.set(selector, [element]);
        }
      }
    }
    return SKIP;
  });
}

/**
 * Returns a list of elements matching the given CSS selector.
 */
export function lookup(
  root: Element[],
  cssSelector: string,
): Element[] | undefined {
  if (!cache.has(root)) load(root);

  // parse the selector to ensure it's valid and normalized
  const ast = compile(cssSelector + '{}');

  if (ast.length !== 1 || ast[0].type !== RULESET) {
    throw new TypeError('Expected a single CSS selector');
  }

  const selector = ast[0].props;

  if (selector.length !== 1) {
    throw new TypeError('Expected a single CSS selector');
  }

  return cache.get(root)?.get(selector[0]);
}

/**
 * Combines the given elements into a single declaration block.
 *
 * Declarations are overwritten in the order they are given; the last
 * declaration for a given property wins.
 *
 * NOTE: `@media`, `@layer`, `@supports`, etc. rules are currently not handled.
 * All declarations will be merged regardless of their parent rules.
 *
 * FIXME: Evalute at-rules and handle them appropriately. This adds a lot of
 * complexity, so consider using happy-dom if they have support for it.
 */
export function reduce(elements: Element[]): Record<string, string> {
  const decls: Record<string, string> = {};

  for (const element of elements) {
    if (element.type === RULESET) {
      for (const child of element.children as Element[]) {
        if (child.type === DECLARATION) {
          decls[child.props as string] = child.children as string;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Unexpected child element type:', child.type);
        }
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn('Unexpected element type:', element.type);
    }
  }

  return decls;
}
