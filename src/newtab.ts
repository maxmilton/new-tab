import { setupSyntheticEvent } from 'stage1';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { append, create, handleClick } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

setupSyntheticEvent('click');
document.body.__click = handleClick;

const app = create('div');
append(BookmarkBar(), app);
append(Search(), app);
append(Menu(), app);
append(app, document.body);
