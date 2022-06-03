import { append, h, S1Node } from 'stage1';
import type { UserStorageData } from '../types';
import { DEFAULT_SECTION_ORDER } from '../utils';
import { SearchResult, SearchResultComponent } from './SearchResult';

type SectionRefs = Record<string, SearchResultComponent>;

const runSearch = (text: string, section: SectionRefs) => {
  const openTabs = section[DEFAULT_SECTION_ORDER[0]];
  const bookmarks = section[DEFAULT_SECTION_ORDER[1]];
  const history = section[DEFAULT_SECTION_ORDER[2]];
  const topSites = section[DEFAULT_SECTION_ORDER[3]];
  const recentlyClosed = section[DEFAULT_SECTION_ORDER[4]];

  if (history) {
    if (text) {
      chrome.history.search({ text }, history.update);
    } else {
      history.update([]);
    }
  }

  if (bookmarks) {
    if (text) {
      chrome.bookmarks.search(text, bookmarks.update);
    } else {
      bookmarks.update([]);
    }
  }

  openTabs?.filter(text);
  topSites?.filter(text);
  recentlyClosed?.filter(text);
};

type SearchComponent = S1Node & HTMLDivElement;
type RefNodes = {
  s: HTMLInputElement;
};

// https://github.com/feathericons/feather/blob/master/icons/search.svg
const view = h(`
  <div class=con>
    <input id=s placeholder="Search browser..." autocomplete=off #s>
    <svg id=i>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
  </div>
`);

export const Search = (): SearchComponent => {
  const root = view as SearchComponent;
  const { s } = view.collect<RefNodes>(root);
  const section: SectionRefs = {};

  s.oninput = () => runSearch(s.value, section);

  s.onkeyup = (event) => {
    if (event.key === 'Escape') {
      s.value = '';
      runSearch('', section);
    }
  };

  chrome.storage.local.get(null, (userSettings: UserStorageData) => {
    const sectionOrder = userSettings.o || DEFAULT_SECTION_ORDER;

    sectionOrder.forEach((name) => {
      section[name] = append(SearchResult(name), root);
    });

    const openTabs = section[DEFAULT_SECTION_ORDER[0]];
    const topSites = section[DEFAULT_SECTION_ORDER[3]];
    const recentlyClosed = section[DEFAULT_SECTION_ORDER[4]];

    if (openTabs) {
      const updateOpenTabs = () => chrome.tabs.query({}, (result) => {
        openTabs.update(result);
        if (s.value) openTabs.filter(s.value);
      });

      updateOpenTabs();

      chrome.tabs.onUpdated.addListener(updateOpenTabs);
      chrome.tabs.onRemoved.addListener(updateOpenTabs);
      chrome.tabs.onMoved.addListener(updateOpenTabs);

      // When opening multiple new-tab pages the browser will continue to update
      // the "Open Tabs" section on all pages, causing a significant performance
      // overhead. The impact is multiplied by the number of open tabs * the
      // number of new-tab pages. The actual problem is work is done even on
      // pages that are not visible and with execution on older pages before the
      // current page. Additionally, the SearchResult component is implemented
      // in a way that produces the smallest JS size and fast execution (remove
      // entire list DOM and insert new DOM fragment) rather than for efficiency
      // (e.g., DOM reconciliation; diff list DOM state and mutate changes
      // minimising adding or removing DOM nodes).

      // TODO: Keep? Causes significantly worse page load speed!

      // // When the page isn't active stop the "Open Tabs" section from updating to
      // // prevent performance issues when users open many new-tab pages.
      // document.onvisibilitychange = () => {
      //   if (document.hidden) {
      //     // @ts-expect-error - force override to kill API method
      //     chrome.tabs.query = () => {};
      //     // chrome.tabs.onUpdated.removeListener(updateOpenTabs);
      //     // chrome.tabs.onRemoved.removeListener(updateOpenTabs);
      //     // chrome.tabs.onMoved.removeListener(updateOpenTabs);
      //   } else {
      //     // eslint-disable-next-line no-restricted-globals
      //     location.reload();
      //   }
      // };
    }

    if (topSites) {
      chrome.topSites.get(topSites.update);
    }

    if (recentlyClosed) {
      chrome.sessions.getRecentlyClosed({}, (sessions) => {
        recentlyClosed.update(
          sessions.map((session) => session.tab).filter((tab) => tab),
        );
      });
    }
  });

  return root;
};
