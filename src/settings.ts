import { append, clone, collect, h } from 'stage1';
import { compile } from 'stage1/macro' with { type: 'macro' };
import { reconcile } from 'stage1/reconcile/non-keyed';
import type {
  SectionOrderItem,
  SyncStorageData,
  ThemesData,
  UserStorageData,
} from './types';
import { DEFAULT_SECTION_ORDER, storage } from './utils';

// TODO: Show errors in the UI.

// TODO: Show a message when the user has disabled all sections.

interface SettingsState {
  order: [SectionOrderItem[], SectionOrderItem[]];
  pushSyncData?(forceUpdate?: boolean): Promise<void>;
}

type ItemIndex = [listIndex: 0 | 1, itemIndex: number];

/** Section drag-and-drop helper functions */
interface SectionScope {
  indexOf(list: 0 | 1, item: SectionOrderItem): number;
  moveItem(from: ItemIndex, to: ItemIndex): void;
}

const DRAG_TYPE = 'text/plain';
const DEFAULT_THEME = 'auto';

// eslint-disable-next-line unicorn/prefer-top-level-await
const themesData = fetch('themes.json').then(
  (response) => response.json() as Promise<ThemesData>,
);

const supportsSync = async (): Promise<boolean> => {
  try {
    await chrome.storage.sync.set({ _: 1 });
    await chrome.storage.sync.remove('_');
    if (chrome.runtime.lastError) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

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
  feedback: Text;
  theme: HTMLSelectElement;
  b: HTMLInputElement;
  se: HTMLUListElement;
  sd: HTMLUListElement;
  reset: HTMLButtonElement;

  feedback2: Text;
  sync: HTMLInputElement;
  pull: HTMLButtonElement;
  push: HTMLButtonElement;
  clear: HTMLButtonElement;
}

const meta = compile(`
  <div>
    <div>@feedback</div>

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
        <legend>DISPLAY (in order)</legend>
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

    <hr>

    <h2>Experimental</h2>

    <h3>Sync Settings</h3>

    <div class=row>
      @feedback2
    </div>

    <div class=row>
      <label>
        <input @sync type=checkbox class=box disabled> Automatically sync settings
      </label>
      <small class=muted>Sync on profile startup (requires sign-in)</small>
    </div>

    <div class=row>
      <button @pull disabled>Pull now (local ⟸ sync)</button>
      <button @push disabled>Push now (local ⟹ sync)</button>
      <button @clear disabled>Reset sync data</button>
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
      await chrome.storage.local.remove('tn');
    }

    void state.pushSyncData?.();
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

      void state.pushSyncData?.();
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

  refs.b.onchange = async () => {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (refs.b.checked) {
      // When value is same as default, we don't need to store it
      await chrome.storage.local.remove('b');
    } else {
      await chrome.storage.local.set({
        b: true,
      });
    }

    void state.pushSyncData?.();
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

  refs.theme.value = themeName;
  refs.b.checked = !storage.b;
  updateOrder([orderEnabled, orderDisabled], true);

  /* ********************************** */
  // Experimental sync settings feature //
  /* ********************************** */

  refs.sync.checked = !!storage.s;

  const updateSync = (syncData: SyncStorageData) => {
    if (syncData.ts) {
      refs.feedback2.nodeValue = `Sync data found (last updated: ${new Date(
        syncData.ts,
      ).toLocaleString()})`;
      refs.pull.disabled = false;
      refs.clear.disabled = false;
    } else {
      refs.feedback2.nodeValue = 'No sync data found';
      refs.pull.disabled = true;
      refs.clear.disabled = true;
    }

    refs.push.disabled = false;
    refs.sync.disabled = false;

    refs.sync.onchange = () => {
      if (refs.sync.checked) {
        void chrome.storage.local.set({
          s: true,
        });
        // @ts-expect-error - doesn't need event argument
        refs.pull.onclick?.();
      } else {
        void chrome.storage.local.remove('s');
      }
    };

    refs.pull.onclick = () => {
      if (syncData.data) {
        void chrome.storage.local.set(syncData.data);
        void updateTheme(syncData.data.tn ?? DEFAULT_THEME);
        updateOrder([syncData.data.o ?? [...DEFAULT_SECTION_ORDER], []], true);
      }
    };

    state.pushSyncData = async (forceUpdate?: boolean) => {
      const { t, s, ...rest } =
        await chrome.storage.local.get<UserStorageData>();

      if (forceUpdate || s) {
        const newSyncData: SyncStorageData = {
          data: rest,
          ts: Date.now(),
        };
        void chrome.storage.sync.set(newSyncData);
        updateSync(newSyncData);
      }
    };

    refs.push.onclick = () => state.pushSyncData!(true);

    refs.clear.onclick = () => {
      void chrome.storage.sync.clear();
      updateSync({});
    };
  };

  void supportsSync().then((canSync) => {
    if (canSync) {
      void chrome.storage.sync.get<SyncStorageData>().then(updateSync);
      // TODO: Listen for sync data changes?
      // chrome.storage.sync.onChanged.addListener((changes) => {});
    } else {
      refs.feedback2.nodeValue = 'Not signed in or sync not supported';
    }
  });

  return root;
};

append(Settings(), document.body);
