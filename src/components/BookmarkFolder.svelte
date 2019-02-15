<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import BookmarkNode from './BookmarkNode.svelte'; // eslint-disable-line import/no-cycle
  import { shorten } from '../common.js';

  // props
  export let lvl = 0;
  export let maxLen = 0;
  export let endNode = false;
  export let _root; // FIXME: Pass in a component reference (?)
  export let _node;

  // reactive data
  let isOpen = false;

  const dispatch = createEventDispatcher();

  const EVENT_NAME = 'open';
  const OPEN_DELAY = 200;
  const CLOSE_DELAY = 400;

  let openTimer = null;
  let closeTimer = null;
  let openListener;

  onDestroy(() => {
    // clean up listener to prevent memory leaks
    if (openListener) openListener.cancel();
  });

  function resetCloseTimer() {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  // set up event listener to close subfolder when another opens
  function onOpen() {
    dispatch(EVENT_NAME, lvl);

    isOpen = true;

    openListener = _root.on(EVENT_NAME, (openLvl) => {
      if (isOpen && openLvl === lvl) {
        isOpen = false;
        resetCloseTimer();
      }
    });
  }

  // subfolder mouse enter
  function handleMouseEnter() {
    if (isOpen) {
      resetCloseTimer();
    } else {
      // delay to prevent accidental folder open
      openTimer = setTimeout(onOpen, OPEN_DELAY);
    }
  }

  // subfolder mouse leave
  function handleMouseLeave() {
    // reset open timer
    if (openTimer !== null) {
      clearTimeout(openTimer);
      openTimer = null;
    }

    // set up subfolder close timer
    if (isOpen) {
      closeTimer = setTimeout(() => {
        isOpen = false;
      }, CLOSE_DELAY);
    }
  }
</script>

<div
  class="item folder{endNode ? ' right' : ''}"
  title="{_node.title}"
  on:mouseenter="{handleMouseEnter}"
  on:mouseleave="{handleMouseLeave}"
>
  {shorten(_node.title, maxLen)}

  {#if lvl !== 0}
    <div class="caret">▸</div>
  {/if}

  {#if isOpen}
    <div class="subfolder{endNode ? ' left' : ''}">
      {#each _node.children as childNode}
        <BookmarkNode _node="{childNode}" lvl="{lvl + 1}" maxLen="{40}" />
      {:else}
        <div class="item">(empty)</div>
      {/each}
    </div>
  {/if}
</div>

<style type="text/postcss">
  :global(.folder) {
    position: relative;
  }

  :global(.caret) {
    padding: 0 6px;
    margin-left: auto;
  }

  :global(.subfolder) {
    position: absolute;
    top: 40px;
    left: 0;
    background: var(--c0);
    box-shadow: var(--s);

    & & {
      top: 0;
      left: 100%;
    }
  }

  /* bookmark item pushed to the right */
  :global(.right) { /* stylelint-disable-line no-descending-specificity */
    justify-content: flex-end;
    width: 100%;
  }

  /* folder which opens to the left */
  :global(.left) { /* stylelint-disable-line no-descending-specificity */
    right: 0;
    left: initial;
    justify-content: initial;

    :global(.subfolder) {
      right: 100%;
      left: initial;
    }
  }
</style>
