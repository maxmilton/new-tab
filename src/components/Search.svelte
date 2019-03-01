<script>
  import { beforeUpdate } from 'svelte';
  import { DEFAULT_ORDER, debounce } from '../common';
  import LinkItem from './LinkItem.svelte';
  import SearchResults from './SearchResults.svelte';

  const SEARCH_DEBOUNCE_DELAY = 260; // ms
  const DEFAULT_RESULTS_AMOUNT = 10;

  // URL protocol regex
  const protocol = /^.*?:\/\//;

  // reactive data
  let bookmarksList = [];
  let bookmarksRaw = [];
  let historyList = [];
  let historyRaw = [];
  let resultsOrder = DEFAULT_ORDER;
  let searchText = '';
  let tabsList = [];
  let tabsRaw = [];
  let topSitesList = [];
  let topSitesRaw = [];

  // computed properties
  let isSearching;
  $: isSearching = !!searchText;

  /**
   * Check if either title or URL match a query.
   * @this {string} Search query
   * @param {{ title: string, url: string }} item
   * @return {boolean}
   */
  function searchFilter({ title, url }) {
    return title.toLowerCase().indexOf(this) > -1
      // remove URL protocol since it's unlikely to be searched for
      || url.replace(protocol, '').toLowerCase().indexOf(this) > -1;
  }

  function doSearch() {
    // reset search when input is empty
    if (searchText === '') {
      bookmarksList = [];
      historyList = [];
      tabsList = tabsRaw;
      topSitesList = topSitesRaw;
      return;
    }

    // search history (run first since it takes the longest)
    chrome.history.search({ text: searchText }, (results) => {
      historyRaw = results;
      historyList = results.slice(0, DEFAULT_RESULTS_AMOUNT);
    });

    // search bookmarks
    chrome.bookmarks.search(searchText, (results) => {
      bookmarksRaw = results;
      bookmarksList = results.slice(0, DEFAULT_RESULTS_AMOUNT);
    });

    // search open tabs
    tabsList = tabsRaw.filter(searchFilter, searchText);
    // search top sites
    topSitesList = topSitesRaw.filter(searchFilter, searchText);
  }

  /** Query the browser for a list of the currently open tabs. */
  function getTabs() {
    chrome.tabs.query({}, (tabs) => {
      if (searchText === '') {
        tabsList = tabs;
        tabsRaw = tabs;
      } else {
        tabsRaw = tabs;
      }
    });
  }

  /**
    * @param {Tab} tab
    * @param {MouseEvent} event
    */
  function handleTabClick(tab, event) {
    event.preventDefault();

    // update current tab
    chrome.tabs.update(tab.id, { active: true });

    // switch active window if the tab isn't in the current window
    chrome.windows.getCurrent({}, (currentWindow) => {
      if (currentWindow.id !== tab.windowId) {
        chrome.windows.update(tab.windowId, { focused: true });
      }
    });

    // close this NTP
    chrome.tabs.getCurrent((currentTab) => {
      chrome.tabs.remove(currentTab.id);
    });
  }

  function maybeCancelSearch(event) {
    if (event.key === 'Escape') {
      searchText = '';
      bookmarksList = [];
      historyList = [];
      tabsList = tabsRaw;
      topSitesList = topSitesRaw;
    }
  }

  chrome.storage.local.get(null, (settings) => {
    /* eslint-disable dot-notation */ // prevent closure from mangling
    if (settings['o']) {
      resultsOrder = settings['o'];
    }
    /* eslint-enable */
  });

  getTabs();

  chrome.topSites.get((sites) => {
    topSitesList = sites;
    topSitesRaw = sites;
  });

  const onSearch = debounce(doSearch, SEARCH_DEBOUNCE_DELAY);

  // update tab list on tab events
  chrome.tabs.onUpdated.addListener(getTabs);
  chrome.tabs.onRemoved.addListener(getTabs);
  chrome.tabs.onMoved.addListener(getTabs);
  chrome.tabs.onAttached.addListener(getTabs);

  // this callback runs whenever props change
  beforeUpdate(() => {
    // TODO: When search is active, rerun when tab events trigger and getTabs() is run
    // FIXME: Do we need to track the previous value of `searchText` and only run this if it's changed?
    if (searchText) {
      onSearch();
    }
  });
</script>

<div class="container">
  <input
    id="search"
    bind:value="{searchText}"
    placeholder="Search browser…"
    autocomplete="off"
    on:keyup="{maybeCancelSearch}"
  >

  {#each resultsOrder as resultSection}
    {#if resultSection === 'Open Tabs'}
      <h2>{`Open Tabs (${tabsList.length}/${tabsRaw.length})`}</h2>

      {#each tabsList as _node}
        <!-- XXX: This is the same as <LinkItem> but with a click handler -->
        <!-- TODO: Once the "better composition" RFC lands see if this can be improved: https://github.com/sveltejs/rfcs/pull/12 -->
        <a href="{_node.url}" title="{_node.title}" on:click="{event => handleTabClick(_node, event)}">
          <img src="chrome://favicon/{_node.url}" class="{_node.title ? 'pad' : ''}">
          {_node.title}
        </a>
      {/each}
    {:else if resultSection === 'Top Sites'}
      <SearchResults
        resultsName="Top Sites"
        resultsList="{topSitesList}"
        resultsRaw="{topSitesRaw}"
      />
    {:else if isSearching && resultSection === 'Bookmarks'}
      <SearchResults
        resultsName="Bookmarks"
        resultsList="{bookmarksList}"
        resultsRaw="{bookmarksRaw}"
      />
    {:else if isSearching && resultSection === 'History'}
      <SearchResults
        resultsName="History"
        resultsList="{historyList}"
        resultsRaw="{historyRaw}"
      />
    {/if}
  {/each}
</div>

<style type="text/postcss">
  /* load more buttons */
  :global(button) {
    width: initial;
    margin-top: 9px;
    cursor: pointer;
  }

  :global(.container) {
    max-width: 800px;
    padding: 0 18px;
    margin: 0 auto;
  }

  /* stylelint-disable no-descending-specificity */
  :global(button),
  :global(#search) {
    box-sizing: border-box;
    width: 100%;
    padding: 11px 20px;
    margin: 0 0 18px;
    font-size: 22px;
    color: var(--t);
    background: var(--c2);
    border: 0;
    border-radius: 24px;
    outline: none;

    &:hover,
    &:focus {
      background: var(--c1);
    }
  }
  /* stylelint-enable */
</style>
