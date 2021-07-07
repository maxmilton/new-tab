import { setupSyntheticEvent } from 'stage1';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { append, createFragment, handleClick } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

setupSyntheticEvent('click');
document.body.__click = handleClick;

const frag = createFragment();
// Create Search component first because it has asynchronous calls that can
// execute while the remaining components are constructed
append(Search(), frag);
append(Menu(), frag);
// Create BookmarkBar component last because it needs to synchronously and
// sequentially calculate DOM layout multiple times and could cause reflow in
// extreme situations, so better to paint the rest of the app first
append(BookmarkBar(), frag);
append(frag, document.body);
