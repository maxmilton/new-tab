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
  s: HTMLInputElement;
};

const view = h`
  <div class=con>
    <input #s id=s placeholder="Search browser..." autocomplete=off>
    <svg viewBox="0 0 24 24" class=is>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
  </div>
`;

export function Search(): SearchComponent {
  const root = view as SearchComponent;
  const { s } = view.collect<RefNodes>(root);
  const section: Sections = {};

  s.oninput = () => debouncedDoSearch(s.value, section);

  s.onkeyup = (event) => {
    if (event.key === 'Escape') {
      s.value = '';
      doSearch('', section);
    }
  };

  // Get user settings
  chrome.storage.local.get(null, (settings: UserStorageData) => {
    const sectionOrder = settings.o || DEFAULT_ORDER;

    sectionOrder.forEach((name) => {
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
