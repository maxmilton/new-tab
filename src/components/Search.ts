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
    <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" class=s-icon>
      <circle cx=11 cy=11 r=8 />
      <line x1=24 y1=24 x2=16.65 y2=16.65 />
    </svg>
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
