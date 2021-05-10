import { h, S1Node } from 'stage1';
import type { UserStorageData } from '../types';
import { append, debounce, DEFAULT_ORDER } from '../utils';
import { SearchResult } from './SearchResult';

type Sections = Record<string, ReturnType<typeof SearchResult> | undefined>;

function doSearch(text: string, section: Sections) {
  const bookmarks = section.Bookmarks;
  const history = section.History;
  const openTabs = section['Open Tabs'];
  const topSites = section['Top Sites'];

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

  if (openTabs) openTabs.filter(text);
  if (topSites) topSites.filter(text);
}

const debouncedDoSearch = debounce(doSearch);

type SearchComponent = S1Node & HTMLDivElement;
type RefNodes = {
  input: HTMLInputElement;
};

const view = h`
  <div class=container>
    <input #input id=search placeholder="Search browser..." autocomplete=off>
    <svg xmlns=http://www.w3.org/2000/svg viewBox="0 0 24 24" class=s-icon>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
  </div>
`;

export function Search(): SearchComponent {
  const root = view as SearchComponent;
  const { input } = view.collect<RefNodes>(root);
  const section: Sections = {};

  input.oninput = () => debouncedDoSearch(input.value, section);

  input.onkeyup = (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      doSearch('', section);
    }
  };

  // Get user settings
  chrome.storage.local.get(null, (settings: UserStorageData) => {
    const order = settings.o || DEFAULT_ORDER;

    order.forEach((name) => {
      section[name] = append(SearchResult(name, []), root);
    });

    const openTabs = section['Open Tabs'];
    const topSites = section['Top Sites'];

    if (openTabs) {
      const updateOpenTabs = () => {
        chrome.tabs.query({}, openTabs.update);
      };

      updateOpenTabs();

      // Update tab list on tab events
      chrome.tabs.onUpdated.addListener(updateOpenTabs);
      chrome.tabs.onRemoved.addListener(updateOpenTabs);
      chrome.tabs.onMoved.addListener(updateOpenTabs);
    }

    if (topSites) {
      chrome.topSites.get(topSites.update);
    }
  });

  return root;
}
