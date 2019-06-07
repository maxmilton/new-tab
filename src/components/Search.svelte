<script>
  import { DEFAULT_ORDER, debounce } from '../common';
  import SearchResults from './SearchResults.svelte';

  const SEARCH_DEBOUNCE_DELAY = 260; // ms
  const DEFAULT_RESULTS_AMOUNT = 10;

  // URL protocol regex
  const protocol = /^.*?:\/\//;

  /** Bookmarks list sorted */
  let bList = [];
  /** Bookmarks list raw */
  let bRaw = [];
  /** History list sorted */
  let hList = [];
  /** History list raw */
  let hRaw = [];
  /** Top sites list sorted */
  let tList = [];
  /** Top sites list raw */
  let tRaw = [];

  // tabs
  let tabsList = [];
  let tabsRaw = [];

  let order = [];
  let searchText = '';

  chrome.storage.local.get(null, (settings) => {
    order = settings['o'] || DEFAULT_ORDER;
  });

  /** Query the browser for a list of the currently open tabs. */
  function getTabs() {
    chrome.tabs.query({}, (tabs) => {
      if (searchText === '') {
        // eslint-disable-next-line no-multi-assign
        tabsList = tabsRaw = tabs;
      } else {
        tabsRaw = tabs;
      }
    });
  }

  /** @param {MouseEvent} obj - A link item mouse click event. */
  function handleTabClick({ target }) {
    const windowId = target.getAttribute('w');

    // update current tab
    chrome.tabs.update(+target.id, { active: true });

    // switch active window if the tab isn't in the current window
    chrome.windows.getCurrent({}, (currentWindow) => {
      if (currentWindow.id !== windowId) {
        chrome.windows.update(windowId, { focused: true });
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
      // eslint-disable-next-line no-multi-assign
      bList = hList = [];
      tabsList = tabsRaw;
      tList = tRaw;
    }
  }

  getTabs();

  chrome.topSites.get((sites) => {
    // eslint-disable-next-line no-multi-assign
    tList = tRaw = sites;
  });

  // update tab list on tab events
  chrome.tabs.onUpdated.addListener(getTabs);
  chrome.tabs.onRemoved.addListener(getTabs);
  chrome.tabs.onMoved.addListener(getTabs);

  /**
   * Check if either title or URL match a query.
   *
   * @this {string} Search query
   * @param {{ title: string, url: string }} item - Item to match against.
   * @returns {boolean} True if a match is found.
   */
  function searchFilter({ title, url }) {
    return title.toLowerCase().indexOf(this) > -1
      // remove URL protocol since it's unlikely to be searched for
      || url.replace(protocol, '').toLowerCase().indexOf(this) > -1;
  }

  function doSearch() {
    // reset search when input is empty
    if (searchText === '') {
      // eslint-disable-next-line no-multi-assign
      bList = hList = [];
      tabsList = tabsRaw;
      tList = tRaw;
      return;
    }

    // search history (run first since it takes the longest)
    chrome.history.search({ text: searchText }, (results) => {
      hRaw = results;
      hList = results.slice(0, DEFAULT_RESULTS_AMOUNT);
    });

    // search bookmarks
    chrome.bookmarks.search(searchText, (results) => {
      bRaw = results;
      bList = results.slice(0, DEFAULT_RESULTS_AMOUNT);
    });

    // search open tabs
    tabsList = tabsRaw.filter(searchFilter, searchText);
    // search top sites
    tList = tRaw.filter(searchFilter, searchText);
  }

  const onSearch = debounce(doSearch, SEARCH_DEBOUNCE_DELAY);

  $: if (searchText) onSearch();
</script>

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

<div class="container">
  <input
    id="search"
    bind:value="{searchText}"
    placeholder="Search browser…"
    autocomplete="off"
    on:keyup="{maybeCancelSearch}"
  >

  {#each order as resultSection}
    {#if resultSection === 'Open Tabs'}
      <h2>{`Open Tabs (${tabsList.length}/${tabsRaw.length})`}</h2>

      <div on:click|capture="{handleTabClick}">
        {#each tabsList as _node}
          <a
            href="{_node.url}"
            id="{_node.id}"
            w="{_node.windowId}"
            title="{_node.title}"
          >
            <img src="chrome://favicon/{_node.url}">
            {_node.title}
          </a>
        {/each}
      </div>
    {:else if resultSection === 'Top Sites'}
      <SearchResults name="Top Sites" list="{tList}" raw="{tRaw}" />
    {:else if !!searchText && resultSection === 'Bookmarks'}
      <SearchResults name="Bookmarks" list="{bList}" raw="{bRaw}" />
    {:else if !!searchText && resultSection === 'History'}
      <SearchResults name="History" list="{hList}" raw="{hRaw}" />
    {/if}
  {/each}
</div>
