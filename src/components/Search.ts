import { h, S1Node } from 'stage1';
import type { UserStorageData } from '../types';
import { append, SECTION_DEFAULT_ORDER } from '../utils';
import { SearchResult, SearchResultComponent } from './SearchResult';

type SectionRefs = Record<string, SearchResultComponent>;

function runSearch(text: string, section: SectionRefs) {
  const openTabs = section[SECTION_DEFAULT_ORDER[0]];
  const bookmarks = section[SECTION_DEFAULT_ORDER[1]];
  const history = section[SECTION_DEFAULT_ORDER[2]];
  const topSites = section[SECTION_DEFAULT_ORDER[3]];
  const recentlyClosed = section[SECTION_DEFAULT_ORDER[4]];

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
}

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
  const section: SectionRefs = {};

  s.oninput = () => runSearch(s.value, section);

  s.onkeyup = (event) => {
    if (event.key === 'Escape') {
      s.value = '';
      runSearch('', section);
    }
  };

  chrome.storage.local.get(null, (userSettings: UserStorageData) => {
    const sectionOrder = userSettings.o || SECTION_DEFAULT_ORDER;

    sectionOrder.forEach((name) => {
      section[name] = append(SearchResult(name, []), root);
    });

    const openTabs = section[SECTION_DEFAULT_ORDER[0]];
    const topSites = section[SECTION_DEFAULT_ORDER[3]];
    const recentlyClosed = section[SECTION_DEFAULT_ORDER[4]];

    if (openTabs) {
      const updateOpenTabs = () => chrome.tabs.query({}, openTabs.update);

      updateOpenTabs();

      chrome.tabs.onUpdated.addListener(updateOpenTabs);
      chrome.tabs.onRemoved.addListener(updateOpenTabs);
      chrome.tabs.onMoved.addListener(updateOpenTabs);
    }

    if (topSites) {
      chrome.topSites.get(topSites.update);
    }

    if (recentlyClosed) {
      chrome.sessions.getRecentlyClosed({}, (sessions) => {
        recentlyClosed.update(
          sessions.map((session) => session.tab).filter((tab) => !!tab),
        );
      });
    }
  });

  return root;
}
