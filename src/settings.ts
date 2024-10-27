import { append, clone, collect, h } from 'stage1';
import { compile } from 'stage1/macro' with { type: 'macro' };
import { reconcile } from 'stage1/reconcile/non-keyed';
import type { SectionOrderItem, ThemesData } from './types';
import { DEFAULT_SECTION_ORDER, storage } from './utils';

// TODO: Show errors in the UI.

// TODO: Show a message when the user has disabled all sections.

interface SettingsState {
  order: [SectionOrderItem[], SectionOrderItem[]];
}

type ItemIndex = [listIndex: 0 | 1, itemIndex: number];

interface SectionScope {
  indexOf(list: 0 | 1, item: SectionOrderItem): number;
  moveItem(from: ItemIndex, to: ItemIndex): void;
}

const DRAG_TYPE = 'text/plain';
const DEFAULT_THEME = 'auto';

// eslint-disable-next-line unicorn/prefer-top-level-await
const themesData = fetch('themes.json').then(
  (res) => res.json() as Promise<ThemesData>,
);

type SectionComponent = HTMLLIElement;

interface SectionRefs {
  name: Text;
}

const searchOnlyView = h('<small class="so muted">(search only)</small>');

// https://tabler-icons.io/i/grip-vertical
const sectionMeta = compile(`
  <li class=item draggable=true>
    <svg viewBox="0 0 24 24" class=icon>
      <circle cx=9 cy=5 r=1 />
      <circle cx=9 cy=12 r=1 />
      <circle cx=9 cy=19 r=1 />
      <circle cx=15 cy=5 r=1 />
      <circle cx=15 cy=12 r=1 />
      <circle cx=15 cy=19 r=1 />
    </svg>
    @name
  </li>
`);
const sectionView = h<SectionComponent>(sectionMeta.html);

const SectionItem = (
  item: SectionOrderItem,
  list: 0 | 1,
  scope: SectionScope,
): SectionComponent => {
  const root = clone(sectionView);
  const refs = collect<SectionRefs>(root, sectionMeta.k, sectionMeta.d);

  refs.name.nodeValue = item;

  if (item === DEFAULT_SECTION_ORDER[1] || item === DEFAULT_SECTION_ORDER[2]) {
    append(clone(searchOnlyView), root);
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

interface Refs {
  feedback: HTMLDivElement;
  theme: HTMLSelectElement;
  b: HTMLInputElement;
  se: HTMLUListElement;
  sd: HTMLUListElement;
  reset: HTMLButtonElement;
}

const meta = compile(`
  <div>
    <div @feedback></div>

    <div class=row>
      <label>Theme</label>
      <select @theme>
        <option value=auto>Automatic (light/dark)</option>
        <option value=light>Light</option>
        <option value=dark>Dark</option>
        <option value=black>Black</option>
        <option value=hacker-blue>Hacker Blue</option>
        <option value=hacker-pink>Hacker Pink</option>
        <option value=hacker-terminal>Hacker Terminal</option>
        <option value=neon-dreams>Neon Dreams</option>
        <option value=tilde-club>Tilde Club</option>
      </select>
    </div>

    <div class=row>
      <label>
        <input @b type=checkbox class=box> Show bookmarks bar
      </label>
    </div>

    <div class=row>
      <label>Sections</label>
      <fieldset>
        <legend>DISPLAY ORDER</legend>
        <ul @se class=item-list></ul>
      </fieldset>
      <fieldset>
        <legend>DISABLED</legend>
        <ul @sd class=item-list></ul>
      </fieldset>
    </div>

    <div class=row>
      <label>Reset</label>
      <button @reset>Reset all settings</button>
    </div>
  </div>
`);
const view = h<HTMLDivElement>(meta.html);

const Settings = () => {
  const root = view;
  const refs = collect<Refs>(root, meta.k, meta.d);

  const state: SettingsState = {
    order: [[], []],
  };

  const scope = {
    indexOf(list: 0 | 1, item: SectionOrderItem): number {
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
    refs.theme.value = themeName;

    await chrome.storage.local.set({
      tn: themeName,
      t: (await themesData)[themeName],
    });

    if (themeName === DEFAULT_THEME) {
      void chrome.storage.local.remove('tn');
    }
  };

  const updateOrder = (order: SettingsState['order'], skipSave?: boolean) => {
    reconcile(refs.se, state.order[0], order[0], (item) =>
      SectionItem(item, 0, scope),
    );
    reconcile(refs.sd, state.order[1], order[1], (item) =>
      SectionItem(item, 1, scope),
    );
    state.order = order;

    if (!skipSave) {
      // When section order is same as default, we don't need to store it
      if (String(order[0]) === String(DEFAULT_SECTION_ORDER)) {
        void chrome.storage.local.remove('o');
      } else {
        void chrome.storage.local.set({
          o: order[0],
        });
      }
    }
  };

  const handleDrop = (list: 0 | 1) => (event: DragEvent) => {
    event.preventDefault();

    if (state.order[list].length > 0) return;

    const from = JSON.parse(
      event.dataTransfer!.getData(DRAG_TYPE),
    ) as ItemIndex;

    scope.moveItem(from, [list, 0]);

    // Remove class in case the `dragleave` event didn't fire
    (event.target as SectionComponent).classList.remove('over');
  };

  refs.theme.onchange = () => updateTheme(refs.theme.value);

  refs.b.onchange = () => {
    if (refs.b.checked) {
      // When value is same as default, we don't need to store it
      void chrome.storage.local.remove('b');
    } else {
      void chrome.storage.local.set({
        b: true,
      });
    }
  };

  // eslint-disable-next-line no-multi-assign
  refs.se.ondragover = refs.sd.ondragover = (event) => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer!.dropEffect = 'move';
  };
  refs.se.ondrop = handleDrop(0);
  refs.sd.ondrop = handleDrop(1);

  refs.reset.onclick = () => {
    void updateTheme(DEFAULT_THEME);
    updateOrder([[...DEFAULT_SECTION_ORDER], []]);
  };

  // Populate UI using user settings data from storage (chrome.storage.local)
  const themeName = storage.tn ?? DEFAULT_THEME;
  const orderEnabled = storage.o ?? [...DEFAULT_SECTION_ORDER];
  const orderDisabled = DEFAULT_SECTION_ORDER.filter(
    (item) => !orderEnabled.includes(item),
  );

  void updateTheme(themeName);
  refs.b.checked = !storage.b;
  updateOrder([orderEnabled, orderDisabled], true);

  return root;
};

append(Settings(), document.body);
