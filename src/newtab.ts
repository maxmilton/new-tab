// FIXME: Submit a PR to fix syntheticEvents types
import { setupSyntheticEvent } from 'stage0/syntheticEvents';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { handleClick } from './utils';

declare global {
  interface Node {
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
