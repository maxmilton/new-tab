<script>
  import { onDestroy } from 'svelte';
  import { listen } from 'svelte/internal';
  import BookmarkNode from './BookmarkNode';

  export let lvl = 0;
  export let end;
  export let node;

  const OPEN_EVENT_NAME = 'open';
  const OPEN_DELAY_MS = 200;
  const CLOSE_DELAY_MS = 400;

  const openEvent = new CustomEvent(OPEN_EVENT_NAME, { detail: lvl });
  let isOpen = false;
  let openTimer;
  let closeTimer;

  const resetCloseTimer = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  /**
   * Close subfolder when another opens.
   *
   * @param {CustomEvent} event - Event dispatched when another subfolder opens.
   */
  const handleOpen = (event) => {
    if (isOpen && event.detail === lvl) {
      isOpen = false;
      resetCloseTimer();
    }
  };

  let cancelOpenListener;

  const onOpen = () => {
    window.dispatchEvent(openEvent);
    cancelOpenListener = listen(window, OPEN_EVENT_NAME, handleOpen);
    isOpen = true;
  };

  // Subfolder mouse enter
  const handleMouseEnter = () => {
    if (isOpen) {
      resetCloseTimer();
    } else {
      // Delay to prevent accidental folder open
      openTimer = setTimeout(onOpen, OPEN_DELAY_MS);
    }
  };

  // Subfolder mouse leave
  const handleMouseLeave = () => {
    // Reset open timer
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }

    // Set up subfolder close timer
    if (isOpen) {
      closeTimer = setTimeout(() => {
        isOpen = false;
        cancelOpenListener();
      }, CLOSE_DELAY_MS);
    }
  };

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
    float: right;
    margin-left: auto;
    padding: 0 6px;
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

  /* Bookmark item pushed to the right */
  :global(.right) { /* stylelint-disable-line no-descending-specificity */
    width: 100%;
    text-align: right;

    & + & {
      width: auto;
    }
  }

  /* Folder which opens to the left */
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
