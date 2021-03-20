import { setupSyntheticEvent } from 'stage0/syntheticEvents';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { handleClick } from './utils';

// TODO: Mention this when creating a types improvement PR to stage0
declare global {
  interface HTMLElement {
    /** Synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

setupSyntheticEvent('click');
document.body.__click = handleClick;

const append = (node: Node) => document.body.appendChild(node);

append(BookmarkBar());
append(Search());
append(Menu());
