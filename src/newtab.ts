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
append(BookmarkBar(), frag);
append(Search(), frag);
append(Menu(), frag);
append(frag, document.body);
