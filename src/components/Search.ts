// TODO: Implement search and list filtering

// TODO: Implement search reset

import h from 'stage0';
import { SearchResult } from './SearchResult';
import { debounce, DEFAULT_ORDER } from '../utils';

function searchLists(text) {
  console.log('## SEARCH TEXT', text);
}

const doSearch = debounce(searchLists);

const view = h`
  <div class=container>
    <input id=search placeholder="Search browser..." autocomplete=off #input>
  </div>
`;

export function Search() {
  const root = view;
  const { input } = view.collect(root);

  const state = {};

  input.oninput = (event) => {
    doSearch(input.value);
  };

  input.onkeyup = (event) => {
    if (event.key === 'Escape') {
      // reset filter
    }
  };

  const update = () => {
    chrome.tabs.query({}, (tabs) => {
      state['Open Tabs'].update(tabs);
    });
  };

  // Get user settings
  chrome.storage.local.get(null, (settings) => {
    const order = settings.o || DEFAULT_ORDER;

    order.forEach((name) => {
      state[name] = root.appendChild(SearchResult(name, []));
    });

    update();

    if (state['Top Sites']) {
      chrome.topSites.get((sites) => {
        state['Top Sites'].update(sites);
      });
    }
  });

  // Update tab list on tab events
  chrome.tabs.onUpdated.addListener(update);
  chrome.tabs.onRemoved.addListener(update);
  chrome.tabs.onMoved.addListener(update);

  return root;
}
