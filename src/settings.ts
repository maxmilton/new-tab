import { append, h } from 'stage1';
import { reconcile } from 'stage1/reconcile/non-keyed';
import type { ThemesData, UserStorageData } from './types';
import { DEFAULT_SECTION_ORDER } from './utils';

type SectionComponent = HTMLLIElement;

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

const themesData = fetch('themes.json').then((res) => res.json()) as Promise<ThemesData>;

// https://tabler-icons.io/i/grip-vertical
const sectionView = h(`
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
`);

const searchOnlyView = h('<small class="so muted">(search only)</small>');

const SectionItem = (
  item: string,
  list: number,
  scope: SectionScope,
): SectionComponent => {
  const root = sectionView.cloneNode(true) as SectionComponent;
  const { name } = sectionView.collect<SectionRefNodes>(root);

  name.nodeValue = item;

  if (item === DEFAULT_SECTION_ORDER[1] || item === DEFAULT_SECTION_ORDER[2]) {
    append(searchOnlyView.cloneNode(true), root);
  }

  root.ondragstart = (event) => {
    event.dataTransfer!.setData(
      DRAG_TYPE,
      JSON.stringify([list, scope.indexOf(list, item)]),
    );
    (event.target as SectionComponent).classList.add('dragging');
  };

  root.ondragend = (event) => {
    (event.target as SectionComponent).classList.remove('dragging');
  };

  root.ondragenter = (event) => {
    (event.target as SectionComponent).classList.add('over');
  };

  root.ondragleave = (event) => {
    (event.target as SectionComponent).classList.remove('over');
  };

  root.ondrop = (event) => {
    event.preventDefault();

    (event.target as SectionComponent).classList.remove('over');

    const from = JSON.parse(
      event.dataTransfer!.getData(DRAG_TYPE),
    ) as ItemIndex;

    scope.moveItem(from, [list, scope.indexOf(list, item)]);
  };

  return root;
};

type SettingsRefNodes = {
  theme: HTMLSelectElement;
  reset: HTMLButtonElement;
  se: HTMLUListElement;
  sd: HTMLUListElement;
};

interface SettingsState {
  order: [string[], string[]];
}

const settingsView = h(`
  <div>
    <div class=row>
      <label>Theme</label>
      <select #theme>
        <option value=light>Light</option>
        <option value=dark>Dark</option>
        <option value=rich-black>Rich Black</option>
        <option value=hacker-terminal>Hacker Terminal</option>
        <option value=neon-dreams>Neon Dreams</option>
        <option value=tilde-club>Tilde Club</option>
      </select>
    </div>

    <div class=row>
      <label>Sections</label>
      <fieldset>
        <legend>DISPLAY ORDER</legend>
        <ul class=item-list #se></ul>
      </fieldset>
      <fieldset>
        <legend>DISABLED</legend>
        <ul class=item-list #sd></ul>
      </fieldset>
    </div>

    <div class=row>
      <label>Reset</label>
      <button #reset>Reset all settings</button>
    </div>
  </div>
`);

const Settings = () => {
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

    void chrome.storage.local.set({
      tn: themeName,
      t: (await themesData)[themeName],
    });
  };

  const updateOrder = (order: SettingsState['order'], noSet?: boolean) => {
    reconcile(se, state.order[0], order[0], (item: string) => SectionItem(item, 0, scope));
    reconcile(sd, state.order[1], order[1], (item: string) => SectionItem(item, 1, scope));
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

  // eslint-disable-next-line no-multi-assign
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

  // Get user settings data
  void chrome.storage.local.get(null).then((settings: UserStorageData) => {
    const themeName = settings.tn || DEFAULT_THEME;
    const orderEnabled = settings.o || DEFAULT_SECTION_ORDER;
    const orderDisabled = DEFAULT_SECTION_ORDER.filter(
      (item) => !orderEnabled.includes(item),
    );

    void updateTheme(themeName);
    updateOrder([orderEnabled, orderDisabled], true);
  });

  return root;
};

append(Settings(), document.body);
