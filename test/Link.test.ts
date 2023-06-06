import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Link } from '../src/components/Link';
import { cleanup, render } from './utils';

test.after.each(cleanup);

test('renders correctly', () => {
  const rendered = render(Link({ title: 'Example', url: 'https://example.com' }));
  const link = rendered.container.querySelector('a');
  assert.ok(link, 'has anchor element');
  assert.is(link?.getAttribute('href'), 'https://example.com', 'has correct href');
  assert.is(link?.getAttribute('title'), 'Example', 'has correct title');
  assert.is(link?.textContent, '\nExample', 'has correct text content');
  const img = rendered.container.querySelector('img');
  assert.ok(img, 'has img element');
  assert.is(img.parentNode, link, 'img is inside anchor');
  assert.is(
    img?.getAttribute('src'),
    '_favicon?size=16&pageUrl=https%3A%2F%2Fexample.com',
    'img has correct src',
  );
  assert.is(img?.getAttribute('decoding'), 'async', 'img has correct decoding');
  assert.snapshot(
    rendered.container.innerHTML,
    '<a href="https://example.com" title="Example">\n<img decoding="async" src="_favicon?size=16&amp;pageUrl=https%3A%2F%2Fexample.com">Example</a>',
  );
});

test.run();
