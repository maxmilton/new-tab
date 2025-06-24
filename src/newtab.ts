// Theme loader code must run first
import './theme';

import { append, fragment } from 'stage1';
import { BookmarkBar } from './components/BookmarkBar.ts';
import { Menu } from './components/Menu.ts';
import { Search } from './components/Search.ts';
import { handleClick, storage } from './utils.ts';

performance.mark('Initialise Components');

const container = fragment();
// Create Search component first because it has asynchronous calls that can
// execute while the remaining components are constructed
append(Search(), container);
// Create BookmarkBar component near last because, after an async call, it needs
// to synchronously and sequentially calculate DOM layout multiple times and
// could cause reflow in extreme situations, so paint the rest of the app first
if (!storage.b) append(BookmarkBar(), container);
append(Menu(), container);
append(container, document.body);

performance.measure('Initialise Components', 'Initialise Components');

document.onclick = handleClick;
