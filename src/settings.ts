// TODO: Prevent `save` running once on init

import h from 'stage0';
import reuseNodes from 'stage0/reuseNodes';
import { DEFAULT_ORDER } from './utils';

const itemView = h`
  <li class=item draggable=true>
    <span class=icon>☰</span>
    #name
    <button class=rm title="Remove section" #rm>REMOVE</button>
  </li>
`;

function Item(item: string, scope) {
  const root = itemView.cloneNode(true) as HTMLLIElement;
  const { name, rm } = itemView.collect(root);

  let _item = item;
  name.nodeValue = _item;

  root.ondragstart = (event) => {
    event.dataTransfer.setData('from', scope.indexOf(_item));
    event.target.classList.add('dragging');
  };

  root.ondragend = (event) => {
    event.target.classList.remove('dragging');
  };

  root.ondragover = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  root.ondragenter = (event) => {
    event.target.classList.add('over');
  };

  root.ondragleave = (event) => {
    event.target.classList.remove('over');
  };

  root.ondrop = (event) => {
    event.preventDefault();
    const from = event.dataTransfer.getData('from');
    scope.moveItem(from, scope.indexOf(_item));

    // Remove class in case the `dragleave` event didn't fire
    event.target.classList.remove('over');
  };

  rm.onclick = () => scope.removeItem(scope.indexOf(_item));

  root.update = (newItem: string) => {
    name.nodeValue = newItem;
    _item = newItem;
  };

  return root;
}

function save(order: string[], theme: string) {
  chrome.storage.local.set({
    o: JSON.stringify(order) === JSON.stringify(DEFAULT_ORDER) ? null : order,
    t: theme,
  });
}

// const settingsView = h`
//   <div>
//     <div class="row">
//       <label>Theme:</label>
//       <select #t>
//         <option value="">Dark</option>
//         <option value="l">Light</option>
//         <option value="b">Rich black</option>
//       </select>
//     </div>

//     <div class="row">
//       <label>List order:</label>
//       <button class="reset" #reset>Reset</button>
//       <ul #o></ul>
//     </div>
//   </div>
// `;
const settingsView = h`
  <div>
    <div class=row>
      <label>Theme:</label>
      <select #t>
        <option value="">Dark</option>
        <option value=l>Light</option>
        <option value=b>Rich black</option>
      </select>
    </div>

    <div class=row>
      <label>List order:</label>
      <button class=reset #reset>Reset</button>
      <ul #o></ul>
    </div>
  </div>
`;

interface SettingsState {
  order: string[];
  theme: string;
}

function Settings() {
  const root = settingsView;
  const { o, reset, t } = settingsView.collect(root);

  const state: SettingsState = {
    order: [],
    theme: '',
  };

  const scope = {
    indexOf(item: string): number {
      return state.order.indexOf(item);
    },
    moveItem(from: number, to: number) {
      const ordered = state.order.slice();
      const item = state.order[from];

      // Remove from previous location
      ordered.splice(from, 1);

      // Add to new location
      ordered.splice(to, 0, item);

      updateOrder(ordered);
    },
    removeItem(index: number) {
      const ordered = state.order.slice();
      ordered.splice(index, 1);
      updateOrder(ordered);
    },
  };

  function updateOrder(order: string[]) {
    if (order !== state.order) {
      reuseNodes(
        o,
        state.order,
        order,
        (item: string) => Item(item, scope),
        (node, item) => node.update(item),
      );
      save(order, state.theme);
      state.order = order.slice();
    }
  }

  function updateTheme(theme: string) {
    if (theme !== state.theme) {
      t.value = theme;
      save(state.order, theme);
      state.theme = theme;
    }
  }

  t.onchange = (event: InputEvent) => {
    updateTheme(event.target.value);
  };

  reset.onclick = () => {
    updateOrder(DEFAULT_ORDER);
  };

  // Get user settings data
  chrome.storage.local.get(null, (settings) => {
    const order = settings.o || DEFAULT_ORDER;
    const theme = settings.t;

    updateOrder(order);
    updateTheme(theme);
  });

  return root;
}

document.body.appendChild(Settings());
