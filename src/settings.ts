/* eslint-disable no-multi-assign */

import { append, h } from 'stage1';
import { reuseNodes } from 'stage1/dist/reconcile/reuse-nodes';
import type { UserStorageData } from './types';
import { DEFAULT_SECTION_ORDER } from './utils';

interface SectionComponent extends HTMLLIElement {
  update(newItem: string): void;
}

type SectionRefNodes = {
  name: Text;
};

type ItemIndex = [listIndex: number, itemIndex: number];

type SectionScope = {
  indexOf(list: number, item: string): number;
  moveItem(from: ItemIndex, to: ItemIndex): void;
};

const DRAG_TYPE = 'text/plain';
const DEFAULT_THEME = 'light';

const themesData = fetch('themes.json').then(
  (res) => res.json() as Promise<Record<string, string>>,
);

// https://tabler-icons.io/i/grip-vertical
const sectionView = h`
  <li class=item draggable=true>
    <svg viewBox="0 0 24 24" class=icon>
      <circle cx=9 cy=5 r=1 />
      <circle cx=9 cy=12 r=1 />
      <circle cx=9 cy=19 r=1 />
      <circle cx=15 cy=5 r=1 />
      <circle cx=15 cy=12 r=1 />
      <circle cx=15 cy=19 r=1 />
    </svg>
    #name
  </li>
`;

const searchOnlyView = h`<small class="so muted">(search only)</small>`;

function OrderSection(
  item: string,
  list: number,
  scope: SectionScope,
): SectionComponent {
  const root = sectionView.cloneNode(true) as SectionComponent;
  const { name } = sectionView.collect<SectionRefNodes>(root);

  let currentItem = item;
  name.nodeValue = currentItem;

  if (
    currentItem === DEFAULT_SECTION_ORDER[1]
    || currentItem === DEFAULT_SECTION_ORDER[2]
  ) {
    append(searchOnlyView.cloneNode(true), root);
  }

  root.ondragstart = (event) => {
    event.dataTransfer!.setData(
      DRAG_TYPE,
      JSON.stringify([list, scope.indexOf(list, currentItem)]),
    );
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

    const from = JSON.parse(
      event.dataTransfer!.getData(DRAG_TYPE),
    ) as ItemIndex;

    scope.moveItem(from, [list, scope.indexOf(list, currentItem)]);

    // Remove class in case the `dragleave` event didn't fire
    (event.target as SectionComponent).classList.remove('over');
  };

  root.update = (newItem) => {
    name.nodeValue = newItem;
    currentItem = newItem;
  };

  return root;
}

type SettingsRefNodes = {
  theme: HTMLSelectElement;
  reset: HTMLButtonElement;
  se: HTMLUListElement;
  sd: HTMLUListElement;
};

interface SettingsState {
  order: [string[], string[]];
}

const settingsView = h`
  <div>
    <div class=row>
      <label>Theme</label>
      <select #theme>
        <option value=dark>Dark</option>
        <option value=light>Light</option>
        <option value=rich-black>Rich black</option>
        <option value=hacker-terminal>Hacker terminal</option>
        <option value=tilde-club>Tilde Club</option>
      </select>
    </div>

    <div class=row>
      <label>Sections</label>
      <fieldset>
        <legend>DISPLAY ORDER</legend>
        <ul #se class=item-list></ul>
      </fieldset>
      <fieldset>
        <legend>DISABLED</legend>
        <ul #sd class=item-list></ul>
      </fieldset>
    </div>

    <div class=row>
      <label>Reset</label>
      <button #reset>Reset all settings</button>
    </div>
  </div>
`;

function Settings() {
  const root = settingsView;
  const {
    theme, reset, se, sd,
  } = settingsView.collect<SettingsRefNodes>(root);

  const state: SettingsState = {
    order: [[], []],
  };

  const scope = {
    indexOf(list: number, item: string): number {
      return state.order[list].indexOf(item);
    },
    moveItem(from: ItemIndex, to: ItemIndex) {
      const reordered: SettingsState['order'] = [
        [...state.order[0]],
        [...state.order[1]],
      ];

      // remove from previous location
      const item = reordered[from[0]].splice(from[1], 1)[0];

      // add to new location
      reordered[to[0]].splice(to[1], 0, item);

      updateOrder(reordered);
    },
  };

  const updateTheme = async (themeName: string) => {
    theme.value = themeName;

    // save user theme setting -- it's a special case which uses localStorage so
    // the code execution is sync (chrome.storage is async) to prevent a flash of
    // unstyled DOM initial page load
    localStorage.t = (await themesData)[themeName];

    void chrome.storage.local.set({
      t: themeName,
    });
  };

  const updateOrder = (order: SettingsState['order'], noSet?: boolean) => {
    reuseNodes(
      se,
      state.order[0],
      order[0],
      (item: string) => OrderSection(item, 0, scope),
      (node, item) => node.update(item),
    );
    reuseNodes(
      sd,
      state.order[1],
      order[1],
      (item: string) => OrderSection(item, 1, scope),
      (node, item) => node.update(item),
    );
    state.order = order;

    if (!noSet) {
      void chrome.storage.local.set({
        o: order[0],
      });
    }
  };

  const handleDrop = (list: number) => (event: DragEvent) => {
    event.preventDefault();

    if (state.order[list].length !== 0) return;

    const from = JSON.parse(
      event.dataTransfer!.getData(DRAG_TYPE),
    ) as ItemIndex;

    scope.moveItem(from, [list, 0]);

    // Remove class in case the `dragleave` event didn't fire
    (event.target as SectionComponent).classList.remove('over');
  };

  se.ondragover = sd.ondragover = (event) => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer!.dropEffect = 'move';
  };

  se.ondrop = handleDrop(0);
  sd.ondrop = handleDrop(1);

  theme.onchange = () => updateTheme(theme.value);

  reset.onclick = () => {
    void updateTheme(DEFAULT_THEME);
    updateOrder([DEFAULT_SECTION_ORDER, []]);
  };

  // get user settings data
  chrome.storage.local.get(null, (settings: UserStorageData) => {
    const themeName = settings.t || DEFAULT_THEME;
    const orderEnabled = settings.o || DEFAULT_SECTION_ORDER;
    const orderDisabled = DEFAULT_SECTION_ORDER.filter(
      (item) => !orderEnabled.includes(item),
    );

    void updateTheme(themeName);
    updateOrder([orderEnabled, orderDisabled], true);
  });

  return root;
}

append(Settings(), document.body);
