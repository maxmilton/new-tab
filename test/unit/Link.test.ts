import { afterEach, expect, test } from 'bun:test';
import { Link, type LinkProps } from '../../src/components/Link';
import { cleanup, render } from './utils';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  const rendered = render(
    Link({ title: 'Example', url: 'https://example.com' } satisfies LinkProps),
  );
  const link = rendered.container.querySelector('a');
  expect(link).toBeTruthy();
  expect(rendered.container.firstChild).toBe(link);
  expect(link?.getAttribute('href')).toBe('https://example.com');
  expect(link?.getAttribute('title')).toBe('Example');
  expect(link?.textContent).toBe('Example');
  const img = rendered.container.querySelector('img');
  expect(img).toBeTruthy();
  expect(img?.parentNode).toBe(link);
  expect(img?.getAttribute('src')).toBe('_favicon?size=16&pageUrl=https%3A%2F%2Fexample.com');
  expect(img?.getAttribute('decoding')).toBe('async');
});

test('rendered DOM matches snapshot', () => {
  const rendered = render(Link({ title: 'Example', url: 'https://example.com' }));
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
