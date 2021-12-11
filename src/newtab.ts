import { append, createFragment, setupSyntheticEvent } from 'stage1';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { handleClick } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

const frag = createFragment();
// Create Search component first because it has asynchronous calls that can
// execute while the remaining components are constructed
append(Search(), frag);
// Create BookmarkBar component near last because, after an async call, it needs
// to synchronously and sequentially calculate DOM layout multiple times and
// could cause reflow in extreme situations, so paint the rest of the app first
append(BookmarkBar(), frag);
append(Menu(), frag);
append(frag, document.body);

document.body.__click = handleClick;
setupSyntheticEvent('click');

// When opening multiple new-tab pages the browser will continue to update the
// "Open Tabs" section on all pages, causing a significant performance overhead.
// The impact is multiplied by the number of open tabs * the number of new-tab
// pages. The actual problem is work is done even on pages that are not visible,
// with execution on older pages before the current page. Additionally, the
// "Open Tabs" section is implemented in a way that produces the smallest JS
// size and fast execution (remove entire list DOM and insert new DOM fragment)
// rather than for efficiency (e.g., DOM reconciliation; diff list DOM state and
// mutate changes minimising adding or removing DOM nodes).

// TODO: Keep? It can actually cause worse first page initial load!

// // When the page isn't active stop the "Open Tabs" section from updating to
// // prevent performance issues when users open many new-tab pages.
// document.onvisibilitychange = () => {
//   if (document.hidden) {
//     // @ts-expect-error - force override to kill API method
//     chrome.tabs.query = () => {};
//   } else {
//     // eslint-disable-next-line no-restricted-globals
//     location.reload();
//   }
// };
