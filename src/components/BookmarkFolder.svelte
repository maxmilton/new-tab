<script>
  /* eslint-disable no-underscore-dangle */

  import { onDestroy } from 'svelte';
  import { listen } from 'svelte/internal';
  import BookmarkNode from './BookmarkNode'; // eslint-disable-line import/no-cycle

  export let lvl = 0;
  export let end;
  export let node;

  const EVENT_NAME = 'open';
  const OPEN_DELAY = 200;
  const CLOSE_DELAY = 400;
  const openEvent = new CustomEvent(EVENT_NAME, { detail: lvl });
  let isOpen = false;
  let openTimer;
  let closeTimer;

  function resetCloseTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  /**
   * Close subfolder when another opens.
   *
   * @param {CustomEvent} event - Event dispatched when another subfolder opens.
   */
  function handleOpen(event) {
    if (isOpen && event.detail === lvl) {
      isOpen = false;
      resetCloseTimer();
    }
  }

  let cancelOpenListener;

  function onOpen() {
    window.dispatchEvent(openEvent);
    cancelOpenListener = listen(window, EVENT_NAME, handleOpen);
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
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }

    // set up subfolder close timer
    if (isOpen) {
      closeTimer = setTimeout(() => {
        isOpen = false;
        cancelOpenListener();
      }, CLOSE_DELAY);
    }
  }

  onDestroy(() => {
    if (cancelOpenListener) {
      cancelOpenListener();
    }
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
    width: 100%;
    text-align: right;

    & + & {
      width: auto;
    }
  }

  /* folder which opens to the left */
  :global(.left) { /* stylelint-disable-line no-descending-specificity */
    right: 0;
    left: initial;
    text-align: left;

    :global(.subfolder) {
      right: 100%;
      left: initial;
    }
  }
</style>

<div
  class="item folder {end ? 'right' : ''}"
  title="{node.title}"
  on:mouseenter="{handleMouseEnter}"
  on:mouseleave="{handleMouseLeave}"
>
  {node.title}

  {#if lvl !== 0}
    <div class="caret">▸</div>
  {/if}

  {#if isOpen}
    <div class="subfolder {end ? 'left' : ''}">
      {#each node.children as childNode}
        <BookmarkNode node="{childNode}" lvl="{lvl + 1}" />
      {:else}
        <div class="item">(empty)</div>
      {/each}
    </div>
  {/if}
</div>
