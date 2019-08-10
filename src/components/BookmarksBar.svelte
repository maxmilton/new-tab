<script>
  import BookmarkNode from './BookmarkNode';

  // Get title text width using the 2d canvas measureText() method as it's
  // faster than adding an element to the DOM but we need to manually
  // calculate any padding etc.

  // const FONT = '18px sans-serif';
  // const TITLE_MAX_WIDTH = 144;
  // const FAVICON_WIDTH = 16;
  // const FAVICON_MARGIN = 6; // margin right
  // const ITEM_PADDING = 13 + 13; // padding left + right

  // reuse the same canvas
  // const canvas2d = new OffscreenCanvas(0, 0).getContext('2d');
  // canvas2d.font = FONT;
  // const ellipsisWidth = canvas2d.measureText('…').width;
  // const titleMaxInnerWidth = TITLE_MAX_WIDTH - ellipsisWidth;

  let bBar = [];
  let bOther = { children: [] };
  let itemCount;

  /** Bookmarks bar DIV element reference. */
  let el;

  // FIXME: Reimplement simply now that CSS only item text width works
  const handleResize = () => {
    // const { length } = bBar;
    // const otherBookmarksWidth = !bOther.children.length
    //   ? 0
    //   : canvas2d.measureText(bOther.title).width + ITEM_PADDING;
    // // eslint-disable-next-line max-len
    // const bBarWidth =
    //   el.offsetWidth - ITEM_PADDING - FAVICON_MARGIN - otherBookmarksWidth;
    // let maxItems = 0;
    // let width = 0;

    // for (; maxItems < length; maxItems += 1) {
    //   // eslint-disable-next-line security/detect-object-injection
    //   const { children, title } = bBar[maxItems];
    //   const hasTitle = title !== undefined;
    //   // eslint-disable-next-line no-nested-ternary
    //   const faviconWidth = children !== undefined
    //     ? 0
    //     : hasTitle
    //       ? FAVICON_WIDTH + FAVICON_MARGIN
    //       : FAVICON_WIDTH;
    //   const realTitleWidth = hasTitle ? canvas2d.measureText(title).width : 0;
    //   const titleWidth = realTitleWidth > titleMaxInnerWidth
    //     ? TITLE_MAX_WIDTH
    //     : realTitleWidth;
    //   const itemWidth = ITEM_PADDING + faviconWidth + titleWidth;
    //   const nextWidth = width + itemWidth;

    //   if (nextWidth > bBarWidth) break;

    //   width = nextWidth;
    // }

    // itemCount = maxItems;
    itemCount = 11;
  };

  /** Visible bookmark nodes. */
  $: vNodes = bBar.slice(0, itemCount);
  /** Overflow bookmark nodes. */
  $: oNodes = ({ children: bBar.slice(itemCount), title: '»' });

  chrome.bookmarks.getTree((tree) => {
    bBar = tree[0].children[0].children;
    bOther = tree[0].children[1]; // eslint-disable-line prefer-destructuring

    handleResize();
  });
</script>

<style type="text/postcss">
  /* stylelint-disable no-descending-specificity */

  :global(.bookmarks) {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    display: flex;
    height: 41px;
    background: var(--c0);
    box-shadow: var(--s);
    contain: size;
    backface-visibility: hidden; /* performance hack; force GPU */

    :global(a),
    :global(.item) {
      padding: 0 13px;

      &:hover,
      &:focus {
        background-color: var(--c);
      }
    }

    :global(a) {
      min-width: max-content;
      max-width: 16ch;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :global(.container) :global(a) {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.subfolder) :global(a) {
    min-width: auto;
    max-width: 38ch;
  }
</style>

<svelte:window on:resize={handleResize} />

<div class="bookmarks" bind:this="{el}">
  {#each vNodes as node}
    <BookmarkNode {node} />
  {/each}

  {#if oNodes.children.length}
    <BookmarkNode node="{oNodes}" end />
  {/if}

  {#if bOther.children.length}
    <BookmarkNode node="{bOther}" end />
  {/if}
</div>
