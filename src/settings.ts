import { h } from 'stage1';
import { reuseNodes } from 'stage1/dist/reconcile/reuse-nodes';
import type { UserStorageData } from './types';
import { append, SECTION_DEFAULT_ORDER } from './utils';

interface SectionComponent extends HTMLLIElement {
  update(newItem: string): void;
}

type SectionRefNodes = {
  name: Text;
  rm: HTMLButtonElement;
};

type SectionScope = {
  indexOf(item: string): number;
  moveItem(from: number, to: number): void;
  removeItem(index: number): void;
};

const DRAG_TYPE = 'text/plain';

const sectionView = h`
  <li class=item draggable=true>
    <span class=icon>☰</span>
    #name
    <button class=rm title="Remove section" #rm>REMOVE</button>
  </li>
`;

function OrderSection(item: string, scope: SectionScope): SectionComponent {
  const root = sectionView.cloneNode(true) as SectionComponent;
  const { name, rm } = sectionView.collect<SectionRefNodes>(root);

  let currentItem = item;
  name.nodeValue = currentItem;

  root.ondragstart = (event) => {
    event.dataTransfer!.setData(DRAG_TYPE, `${scope.indexOf(currentItem)}`);
    (event.target as SectionComponent).classList.add('dragging');
  };

  root.ondragend = (event) => {
    (event.target as SectionComponent).classList.remove('dragging');
  };

  root.ondragover = (event) => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer!.dropEffect = 'move';
  };

  root.ondragenter = (event) => {
    (event.target as SectionComponent).classList.add('over');
  };

  root.ondragleave = (event) => {
    (event.target as SectionComponent).classList.remove('over');
  };

  root.ondrop = (event) => {
    event.preventDefault();
    const from = event.dataTransfer!.getData(DRAG_TYPE);
    scope.moveItem(+from, scope.indexOf(currentItem));

    // Remove class in case the `dragleave` event didn't fire
    (event.target as SectionComponent).classList.remove('over');
  };

  rm.onclick = () => scope.removeItem(scope.indexOf(currentItem));

  root.update = (newItem) => {
    name.nodeValue = newItem;
    currentItem = newItem;
  };

  return root;
}

type SettingsRefNodes = {
  o: HTMLOListElement;
  reset: HTMLButtonElement;
  t: HTMLSelectElement;
};

interface SettingsState {
  order: string[];
}

const settingsView = h`
  <div>
    <div class=row>
      <label>Theme:</label>
      <select #t>
        <option value="">Dark</option>
        <option value=l>Light</option>
        <option value=b>Rich black</option>
        <option value=h>Hacker terminal</option>
      </select>
    </div>

    <div class=row>
      <label>List order:</label>
      <button class=reset #reset>Reset</button>
      <ul #o></ul>
    </div>
  </div>
`;

function Settings() {
  const root = settingsView;
  const { o, reset, t } = settingsView.collect<SettingsRefNodes>(root);

  const state: SettingsState = {
    order: [],
  };

  const scope = {
    indexOf(item: string): number {
      return state.order.indexOf(item);
    },
    moveItem(from: number, to: number) {
      const reordered = [...state.order];

      // add to new location
      reordered.splice(
        to,
        0,
        // remove from previous location
        reordered.splice(from, 1)[0],
      );

      updateOrder(reordered);
    },
    removeItem(index: number) {
      const ordered = [...state.order];
      ordered.splice(index, 1);
      updateOrder(ordered);
    },
  };

  const updateOrder = (
    order: typeof SECTION_DEFAULT_ORDER,
    noSet?: boolean,
  ) => {
    if (order !== state.order) {
      reuseNodes(
        o,
        state.order,
        order,
        (item: string) => OrderSection(item, scope),
        (node, item) => node.update(item),
      );
      state.order = order;

      if (!noSet) {
        chrome.storage.local.set({
          o: order,
        });
      }
    }
  };

  t.onchange = () => {
    localStorage.t = t.value;
  };

  reset.onclick = () => {
    updateOrder(SECTION_DEFAULT_ORDER);
  };

  // get user settings data
  chrome.storage.local.get(null, (settings: UserStorageData) => {
    const order = settings.o || SECTION_DEFAULT_ORDER;

    updateOrder(order, true);
  });

  // get user theme setting -- it's a special case which uses localStorage
  // because it must be sync (chrome.storage is async) to prevent default theme
  // colours flashing on initial page load
  t.value = localStorage.t as string;

  return root;
}

append(Settings(), document.body);
