import { append, collect, h } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };
import type { SectionOrderItem } from "../types.ts";
import { chromeBookmarks, chromeTabs, DEFAULT_SECTION_ORDER, storage } from "../utils.ts";
import { SearchResult, type SearchResultComponent } from "./SearchResult.ts";

type SectionRefs = Partial<Record<SectionOrderItem, SearchResultComponent>>;

// TODO: Single use vars should be automatically inlined by the minifier.

// const searchFor = (text: string, sections: SectionRefs) => {
//   const openTabs = sections[DEFAULT_SECTION_ORDER[0]];
//   const bookmarks = sections[DEFAULT_SECTION_ORDER[1]];
//   const history = sections[DEFAULT_SECTION_ORDER[2]];
//   const topSites = sections[DEFAULT_SECTION_ORDER[3]];
//   const recentlyClosed = sections[DEFAULT_SECTION_ORDER[4]];
//
//   if (history) {
//     if (text) {
//       chrome.history.search({ text }, history.$$update);
//     } else {
//       history.$$update([]);
//     }
//   }
//
//   if (bookmarks) {
//     if (text) {
//       chrome.bookmarks.search(text, bookmarks.$$update);
//     } else {
//       bookmarks.$$update([]);
//     }
//   }
//
//   openTabs?.$$filter(text);
//   topSites?.$$filter(text);
//   recentlyClosed?.$$filter(text);
// };

const searchFor = (text: string, sections: SectionRefs) => {
  const history = sections[DEFAULT_SECTION_ORDER[2]];
  const bookmarks = sections[DEFAULT_SECTION_ORDER[1]];

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

  // Open Tabs
  sections[DEFAULT_SECTION_ORDER[0]]?.$$filter(text);
  // Top Sites
  sections[DEFAULT_SECTION_ORDER[3]]?.$$filter(text);
  // Recently Closed Tabs
  sections[DEFAULT_SECTION_ORDER[4]]?.$$filter(text);
};

type SearchComponent = HTMLDivElement;

interface Refs {
  s: HTMLInputElement;
}

// https://github.com/feathericons/feather/blob/master/icons/search.svg
const meta = compile<Refs>(`
  <div id=c>
    <input @s id=s type=search placeholder="Search browser...">
    <svg id=i>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
  </div>
`);
const view = h<SearchComponent>(meta.html);

export const Search = (): SearchComponent => {
  const root = view;
  const refs = collect<Refs>(root, meta.d);
  const input = refs[meta.ref.s];
  const sections: SectionRefs = {};

  input.oninput = () => searchFor(input.value, sections);

  input.onkeyup = (event) => {
    if (event.key === "Escape") {
      searchFor(input.value = "", sections);
    }
  };

  performance.mark("Load Sections");

  const sectionOrder = storage.o ?? DEFAULT_SECTION_ORDER;

  sectionOrder.forEach((name) => {
    sections[name] = append(SearchResult(name), root);
  });

  const openTabs = sections[DEFAULT_SECTION_ORDER[0]];
  const topSites = sections[DEFAULT_SECTION_ORDER[3]];
  const recentlyClosed = sections[DEFAULT_SECTION_ORDER[4]];

  if (openTabs) {
    const updateOpenTabs = () =>
      chromeTabs.query({}, (tabs) => {
        openTabs.$$update(tabs);
        if (input.value) {
          openTabs.$$filter(input.value);
        }
      });

    updateOpenTabs();

    // TODO: Handle race condition where onUpdated is called for this tab on load.
    chromeTabs.onUpdated.addListener(updateOpenTabs);
    chromeTabs.onRemoved.addListener(updateOpenTabs);
    chromeTabs.onMoved.addListener(updateOpenTabs);

    // When opening multiple new-tab pages the browser will continue to update
    // the "Open Tabs" section on all pages, causing a significant performance
    // overhead. The impact is multiplied by the number of open tabs * the
    // number of new-tab pages. On top of that, it seems the browser reuses the
    // same process for all new-tab pages, causing resource contention for all
    // these updates. The actual problem is work is done even on pages that are
    // not visible and with execution on older pages before the/ current page.
    // Additionally, the SearchResult component is implemented in a way that
    // produces the smallest JS size and fast execution (remove entire list DOM
    // and insert new DOM fragment) rather than for efficiency (e.g., DOM
    // reconciliation; diff list DOM state and mutate changes minimising adding
    // or removing DOM nodes).

    // TODO: Keep? Causes significantly worse page load speed!

    // TODO: Alternative implementation? One of:
    //  ↳ Simple lock to disable updates when the page isn't active
    //  ↳ Web Locks API to prevent multiple pages from updating together
    //  ↳ Shared worker to manage the state of the open tabs
    //  ↳ Only update specific change from listener Event

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
    chrome.topSites.get(topSites.$$update);
  }

  if (recentlyClosed) {
    chrome.sessions.getRecentlyClosed({}, (sessions) => {
      recentlyClosed.$$update(
        sessions.map((session) => session.tab).filter(Boolean),
      );
    });
  }

  performance.measure("Load Sections", "Load Sections");

  return root;
};
