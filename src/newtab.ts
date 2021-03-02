// FIXME: Submit a PR to add `export default` for consistency
import { setupSyntheticEvent } from 'stage0/syntheticEvents';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { handleClick } from './utils';

setupSyntheticEvent('click');
document.body.__click = handleClick;

const append = (node: Node) => document.body.appendChild(node);

append(BookmarkBar());
append(Search());
append(Menu());
