<script>
  /* eslint-disable no-underscore-dangle */

  import { onDestroy } from 'svelte';
  import BookmarkNode from './BookmarkNode'; // eslint-disable-line import/no-cycle
  import { shorten } from '../common';

  // props
  export let lvl = 0;
  export let maxLen = 0;
  export let endNode = false;
  export let _node;

  // reactive data
  let isOpen = false;

  const EVENT_NAME = 'open';
  const OPEN_DELAY = 200;
  const CLOSE_DELAY = 400;

  const openEvent = new CustomEvent(EVENT_NAME, { detail: lvl });
  let openTimer = null;
  let closeTimer = null;

  function resetCloseTimer() {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  /**
   * Close subfolder when another opens.
   * @param {CustomEvent} event Event dispatched when another subfolder opens.
   */
  function handleOpen(event) {
    if (isOpen && event.detail === lvl) {
      isOpen = false;
      resetCloseTimer();
    }
  }

  function onOpen() {
    window.dispatchEvent(openEvent);
    window.addEventListener(EVENT_NAME, handleOpen);
    isOpen = true;
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
        window.removeEventListener(EVENT_NAME, handleOpen);
      }, CLOSE_DELAY);
    }
  }

  onDestroy(() => {
    window.removeEventListener(EVENT_NAME, handleOpen);
  });
</script>

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
