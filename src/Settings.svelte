<script>
  import { afterUpdate } from 'svelte';
  import { DEFAULT_ORDER } from './common';

  let order = [];
  let pageTheme = '';

  // check existing settings
  chrome.storage.local.get(null, (settings) => {
    /* eslint-disable dot-notation */ // prevent closure mangling
    order = settings['o'] || DEFAULT_ORDER;
    pageTheme = settings['t'];
    /* eslint-enable */
  });

  // this callback runs after the view is updated
  afterUpdate(() => {
    /* eslint-disable quote-props */ // prevent closure mangling
    chrome.storage.local.set({
      'o': JSON.stringify(order) === JSON.stringify(DEFAULT_ORDER)
        ? null
        : order,
      't': pageTheme,
    });
    /* eslint-enable */
  });

  function resetOrder() {
    order = [...DEFAULT_ORDER];
  }

  function moveItem(from, to) {
    const ordered = [...order];
    // eslint-disable-next-line security/detect-object-injection
    const item = order[from];

    // remove from previous location
    ordered.splice(from, 1);

    // add to new location
    ordered.splice(to, 0, item);

    order = ordered;
  }

  function removeItem(index) {
    const ordered = [...order];
    ordered.splice(index, 1);
    order = ordered;
  }

  function handleDragStart(event, index) {
    event.dataTransfer.setData('from', index);
    event.target.classList.add('dragging');
  }

  function handleDragEnd(event) {
    event.target.classList.remove('dragging');
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move'; // eslint-disable-line no-param-reassign
  }

  function handleDragEnter(event) {
    event.target.classList.add('over');
  }

  function handleDragLeave(event) {
    event.target.classList.remove('over');
  }

  function handleDrop(event, index) {
    event.preventDefault();
    const from = event.dataTransfer.getData('from');
    moveItem(from, index);

    // remove class in case the dragleave event didn't fire
    event.target.classList.remove('over');
  }
</script>

<style type="text/postcss">
  :global(body) {
    font-size: 18px;
  }

  :global(ul) {
    padding-left: 0;
    list-style: none;
  }

  :global(.row) {
    margin-bottom: 18px;
  }

  :global(.item) {
    padding: 6px 10px;
    margin: 6px 0;
    cursor: grab;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 2px;
  }

  /* TODO: Improve the styling technique */
  :global(.rm) {
    position: relative;
    top: -7px;
    right: -12px;
    float: right;
    cursor: pointer;
  }

  :global(.icon) {
    margin-right: 10px;
    color: rgb(180, 180, 180);

    .item:hover > &,
    .item:focus > & {
      color: rgb(110, 110, 110);
    }
  }

  :global(.dragging) { /* stylelint-disable-line no-descending-specificity */
    border-style: dashed;
    opacity: 0.4;
  }

  :global(.over) { /* stylelint-disable-line no-descending-specificity */
    /* stylelint-disable-next-line declaration-no-important */
    border-color: rgb(21, 48, 167) !important;
  }
</style>

<div class="row">
  <label>Theme:</label>
  <select bind:value="{pageTheme}">
    <option value="d">Dark</option>
    <option value="">Light</option>
  </select>
</div>

<div class="row">
  <label>List order:</label>
  <button on:click="{resetOrder}">Reset</button>
  <ul>
    {#each order as _item, index (_item)}
      <li
        class="item"
        draggable="true"
        on:dragstart="{event => handleDragStart(event, index)}"
        on:dragend="{event => handleDragEnd(event)}"
        on:dragover="{event => handleDragOver(event)}"
        on:dragenter="{event => handleDragEnter(event)}"
        on:dragleave="{event => handleDragLeave(event)}"
        on:drop="{event => handleDrop(event, index)}"
      >
        <span class="icon">☰</span>
        {_item}
        <button
          class="rm"
          title="Remove section"
          on:click="{() => removeItem(index)}"
        >
          🗑
        ️</button>
      </li>
    {/each}
  </ul>
</div>
