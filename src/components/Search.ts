import { append, collect, h } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };
import type { SectionOrderItem } from "#/types.ts";
import { chromeBookmarks, chromeTabs, DEFAULT_SECTION_ORDER, storage } from "#/utils.ts";
import { SearchResult, type SearchResultComponent } from "./SearchResult.ts";

type SearchComponent = HTMLDivElement;

interface Refs {
  search: HTMLInputElement;
}

// https://github.com/feathericons/feather/blob/master/icons/search.svg
const meta = compile<Refs>(/* html */ `
  <div id=c>
    <input @search id=s type=search placeholder="Search browser...">
    <svg id=i>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
  </div>
`);
const view = h<SearchComponent>(meta.html);

export const Search = (): SearchComponent => {
  const root = view;
  const refs = collect(root, meta.d);
  const input = refs[meta.ref.search];
  const sections: Partial<Record<SectionOrderItem, SearchResultComponent>> = {};

  performance.mark("Load Sections");

  const sectionOrder = storage.o ?? DEFAULT_SECTION_ORDER;

  sectionOrder.forEach((name) => {
    sections[name] = append(SearchResult(name), root);
  });

  const openTabs = sections[DEFAULT_SECTION_ORDER[0]];
  const bookmarks = sections[DEFAULT_SECTION_ORDER[1]];
  const history = sections[DEFAULT_SECTION_ORDER[2]];
  const topSites = sections[DEFAULT_SECTION_ORDER[3]];
  const recentlyClosed = sections[DEFAULT_SECTION_ORDER[4]];

  const query = (text: string) => {
    if (history) {
      if (text) {
        chrome.history.search({ text }, history.$$update);
      } else {
        history.$$update([]);
      }
    }

    if (bookmarks) {
      if (text) {
        chromeBookmarks.search(text, bookmarks.$$update);
      } else {
        bookmarks.$$update([]);
      }
    }

    openTabs?.$$filter(text);
    topSites?.$$filter(text);
    recentlyClosed?.$$filter(text);
  };

  if (openTabs) {
    let pending: boolean;

    const updateOpenTabs = () => {
      pending = false;
      chromeTabs.query({}, (tabs) => {
        openTabs.$$update(tabs);
        if (input.value) {
          openTabs.$$filter(input.value);
        }
      });
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(updateOpenTabs);
    };

    updateOpenTabs();

    chromeTabs.onUpdated.addListener(schedule);
    chromeTabs.onRemoved.addListener(schedule);
    chromeTabs.onMoved.addListener(schedule);
  }

  if (topSites) {
    chrome.topSites.get(topSites.$$update);
  }

  if (recentlyClosed) {
    chrome.sessions.getRecentlyClosed({}, (sessions) => {
      recentlyClosed.$$update(sessions.map((session) => session.tab).filter(Boolean));
    });
  }

  performance.measure("Load Sections", "Load Sections");

  input.oninput = () => query(input.value);

  input.onkeyup = (event) => {
    if (event.key === "Escape") {
      query((input.value = ""));
    }
  };

  return root;
};
