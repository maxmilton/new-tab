import { setupSyntheticEvent } from 'stage0/syntheticEvents';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { append, create, handleClick } from './utils';

// TODO: Mention this when creating a types improvement PR to stage0
declare global {
  interface HTMLElement {
    /** `stage0` synthetic click event handler. */
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
