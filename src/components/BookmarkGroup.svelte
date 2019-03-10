<script>
  import BookmarkNode from './BookmarkNode.svelte';

  // Get title text width using the 2d canvas measureText() method as it's
  // faster than adding an element to the DOM but we need to manually
  // calculate any padding etc.

  const FONT = '18px sans-serif';
  const TITLE_MAX_WIDTH = 144;
  const FAVICON_WIDTH = 16;
  const FAVICON_MARGIN = 6; // margin right
  const ITEM_PADDING = 13 + 13; // padding left + right

  // reuse the same canvas
  const canvas2d = new OffscreenCanvas(0, 0).getContext('2d');
  canvas2d.font = FONT;
  const ellipsisWidth = canvas2d.measureText('…').width;
  const titleMaxInnerWidth = TITLE_MAX_WIDTH - ellipsisWidth;

  // data
  let bookmarksBar = [];
  let bookmarksOther = { children: [] };
  let itemCount;
  let barEl;

  let visibleNodes;
  let overflowNodes;

  // computed properties
  $: visibleNodes = bookmarksBar.slice(0, itemCount);
  $: overflowNodes = ({ children: bookmarksBar.slice(itemCount), title: '»' });

  function handleResize() {
    const { length } = bookmarksBar;
    const otherBookmarksWidth = !bookmarksOther.children.length
      ? 0
      : canvas2d.measureText(bookmarksOther.title).width + ITEM_PADDING;
    // eslint-disable-next-line max-len
    const bookmarksBarWidth = barEl.offsetWidth - ITEM_PADDING - FAVICON_MARGIN - otherBookmarksWidth;
    let maxItems = 0;
    let width = 0;

    for (; maxItems < length; maxItems += 1) {
      // eslint-disable-next-line security/detect-object-injection
      const { children, title } = bookmarksBar[maxItems];
      const hasTitle = title !== undefined;
      // eslint-disable-next-line no-nested-ternary
      const faviconWidth = children !== undefined
        ? 0
        : hasTitle
          ? FAVICON_WIDTH + FAVICON_MARGIN
          : FAVICON_WIDTH;
      const realTitleWidth = hasTitle ? canvas2d.measureText(title).width : 0;
      const titleWidth = realTitleWidth > titleMaxInnerWidth
        ? TITLE_MAX_WIDTH
        : realTitleWidth;
      const itemWidth = ITEM_PADDING + faviconWidth + titleWidth;
      const nextWidth = width + itemWidth;

      if (nextWidth > bookmarksBarWidth) break;

      width = nextWidth;
    }

    itemCount = maxItems;
  }

  chrome.bookmarks.getTree((tree) => {
    bookmarksBar = tree[0].children[0].children;
    bookmarksOther = tree[0].children[1]; // eslint-disable-line prefer-destructuring

    handleResize();
  });

  window.addEventListener('resize', handleResize);
</script>

<div id="bookmarks" bind:this="{barEl}">
  {#each visibleNodes as _node}
    <BookmarkNode {_node} maxLen="{15}" lvl="{0}" />
  {/each}

  {#if overflowNodes.children.length}
    <BookmarkNode _node="{overflowNodes}" lvl="{0}" maxLen="{40}" endNode />
  {/if}

  {#if bookmarksOther.children.length}
    <BookmarkNode _node="{bookmarksOther}" lvl="{0}" maxLen="{40}" endNode />
  {/if}
</div>

<style type="text/postcss">
  :global(#bookmarks) {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    display: flex;
    height: 41px;
    background: var(--c0);
    box-shadow: var(--s);
    backface-visibility: hidden; /* performance hack; force GPU */
  }
</style>
