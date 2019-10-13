<script>
  import { DEFAULT_ORDER, debounce } from '../utils';
  import SearchResults from './SearchResults.svelte';

  const SEARCH_DEBOUNCE_DELAY_MS = 260;
  const DEFAULT_RESULTS_AMOUNT = 10;

  /** URL protocol regex. */
  const protocolRe = /^.*?:\/\//;

  /** Sorted bookmarks list. */
  let bList = [];
  /** Raw bookmarks list. */
  let bRaw = [];
  /** Sorted history list. */
  let hList = [];
  /** Raw history list. */
  let hRaw = [];
  /** Sorted top sites list. */
  let tList = [];
  /** Raw top sites list. */
  let tRaw = [];
  let tabsList = [];
  let tabsRaw = [];
  let order = [];
  let searchText = '';

  /** Query the browser for a list of the currently open tabs. */
  const getTabs = () => {
    chrome.tabs.query({}, (tabs) => {
      if (searchText === '') {
        // eslint-disable-next-line no-multi-assign
        tabsList = tabsRaw = tabs;
      } else {
        tabsRaw = tabs;
      }
    });
  };

  /** @param {MouseEvent} obj - A link item mouse click event. */
  const handleTabClick = ({ target }) => {
    const windowId = target.getAttribute('w');

    // Update current tab
    chrome.tabs.update(+target.id, { active: true });

    // Switch active window if the tab isn't in the current window
    chrome.windows.getCurrent({}, (currentWindow) => {
      if (currentWindow.id !== windowId) {
        chrome.windows.update(windowId, { focused: true });
      }
    });

    // Close this NTP
    chrome.tabs.getCurrent((currentTab) => {
      chrome.tabs.remove(currentTab.id);
    });
  };

  const maybeCancelSearch = (event) => {
    if (event.key === 'Escape') {
      searchText = '';
      // eslint-disable-next-line no-multi-assign
      bList = hList = [];
      tabsList = tabsRaw;
      tList = tRaw;
    }
  };

  /**
   * Check if either title or URL match a query.
   *
   * @this {string} Search query.
   * @param {object} obj - Options.
   * @param {string} obj.title - Title to match against.
   * @param {string} obj.url - URL to match against.
   * @returns {boolean} True if a match is found.
   */
  const searchFilter = ({ title, url }) =>
    title.toLowerCase().indexOf(this) > -1
    // Remove URL protocol since it's unlikely to be searched for
    || url.replace(protocolRe, '').toLowerCase().indexOf(this) > -1;


  const doSearch = () => {
    // Reset search when input is empty
    if (!searchText) {
      // eslint-disable-next-line no-multi-assign
      bList = hList = [];
      tabsList = tabsRaw;
      tList = tRaw;
      return;
    }

    // Search history (run first since it takes the longest)
    chrome.history.search({ text: searchText }, (results) => {
      hRaw = results;
      hList = results.slice(0, DEFAULT_RESULTS_AMOUNT);
    });

    // Search bookmarks
    chrome.bookmarks.search(searchText, (results) => {
      bRaw = results;
      bList = results.slice(0, DEFAULT_RESULTS_AMOUNT);
    });

    // Search open tabs
    tabsList = tabsRaw.filter(searchFilter, searchText);
    // Search top sites
    tList = tRaw.filter(searchFilter, searchText);
  };

  const onSearch = debounce(doSearch, SEARCH_DEBOUNCE_DELAY_MS);

  chrome.storage.local.get(null, (settings) => {
    order = settings['o'] || DEFAULT_ORDER;
  });

  getTabs();

  chrome.topSites.get((sites) => {
    // eslint-disable-next-line no-multi-assign
    tList = tRaw = sites;
  });

  // Update tab list on tab events
  chrome.tabs.onUpdated.addListener(getTabs);
  chrome.tabs.onRemoved.addListener(getTabs);
  chrome.tabs.onMoved.addListener(getTabs);

  $: if (searchText) onSearch();
</script>

<style type="text/postcss">
  /* "Load more" buttons */
  :global(button) {
    width: initial;
    margin-top: 9px;
    cursor: pointer;
  }

  :global(.container) {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 18px;
  }

  /* stylelint-disable no-descending-specificity */
  :global(button),
  :global(#search) {
    box-sizing: border-box;
    width: 100%;
    margin: 0 0 35px;
    padding: 11px 20px;
    color: var(--t);
    font-size: 21px;
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
            <img src="chrome://favicon/{_node.url}" />
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
