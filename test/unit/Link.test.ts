import { afterEach, expect, test } from 'bun:test';
import { Link } from '../../src/components/Link';
import { cleanup, render } from './utils';

afterEach(cleanup);

test('renders correctly', () => {
  const rendered = render(Link({ title: 'Example', url: 'https://example.com' }));
  const link = rendered.container.querySelector('a');
  expect(link).toBeTruthy();
  expect(link?.getAttribute('href')).toBe('https://example.com');
  expect(link?.getAttribute('title')).toBe('Example');
  expect(link?.textContent).toBe('\nExample');
  const img = rendered.container.querySelector('img');
  expect(img).toBeTruthy();
  expect(img?.parentNode).toBe(link);
  expect(img?.getAttribute('src')).toBe('_favicon?size=16&pageUrl=https%3A%2F%2Fexample.com');
  expect(img?.getAttribute('decoding')).toBe('async');
  // expect(rendered.container.innerHTML).toMatchInlineSnapshot(
  //   `"<a href=\\"https://example.com\\" title=\\"Example\\"><img decoding=\\"async\\" src=\\"_favicon?size=16&amp;pageUrl=https%3A%2F%2Fexample.com\\">Example</a>"`,
  // );
  expect(rendered.container.innerHTML).toMatchSnapshot();
});
