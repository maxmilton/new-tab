// Theme loader code must run first
import './theme';

import { append, createFragment } from 'stage1';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { handleClick, storage } from './utils';

performance.mark('Initialise Components');

const frag = createFragment();
// Create Search component first because it has asynchronous calls that can
// execute while the remaining components are constructed
append(Search(), frag);
// Create BookmarkBar component near last because, after an async call, it needs
// to synchronously and sequentially calculate DOM layout multiple times and
// could cause reflow in extreme situations, so paint the rest of the app first
if (!storage.b) append(BookmarkBar(), frag);
append(Menu(), frag);
append(frag, document.body);

performance.measure('Initialise Components', 'Initialise Components');

document.onclick = handleClick;
