import { afterEach, expect, test } from 'bun:test';
import { cleanup, render } from '@maxmilton/test-utils/dom';
import { Link, type LinkProps } from '../../src/components/Link';

afterEach(cleanup);

test('rendered DOM contains expected elements', () => {
  expect.assertions(9);
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
  expect.assertions(1);
  const rendered = render(Link({ title: 'Example', url: 'https://example.com' }));
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
