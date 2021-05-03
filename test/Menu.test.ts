import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Menu } from '../src/components/Menu';
import { setup, render, cleanup } from './utils';

test.before(setup);
test.after.each(cleanup);

// test('renders correctly', () => {
//   const rendered = render(Menu());
//   rendered.debug();
//
//   assert.snapshot(rendered.container.innerHTML, '');
// });

test('test util can render', () => {
  const el = document.createElement('a');
  el.className = 'link';

  const rendered = render(el);
  rendered.debug();
  console.log('IN TEST');

  assert.snapshot(rendered.container.innerHTML, '');
});

test.run();
