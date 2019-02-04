<!--
  TODO: Try to accomplish the same short text like shorten() but with CSS only
  and without  adding any wrapper elements.

  TODO: Add padding to img if there is a textNode but try to do it without
  using JS based logic to keep the component logic free.
-->

<script>
  import { shorten } from '../common.js';

  export let _node;
  export let maxLen;
</script>

<a href="{_node.url}" title="{_node.title}">
  <img src="chrome://favicon/{_node.url}" class="{_node.title && 'pad'}">
  {shorten(_node.title, maxLen)}
</a>

<style type="text/postcss">
  /* all <img> are favicons */
  :global(img) {
    width: 16px;
    height: 16px; /* prevents slight realignment jump on initial load */
    pointer-events: none; /* prevent being the click event target */
  }

  :global(.pad) {
    margin: 0 6px 0 0;
  }

  /* stylelint-disable-next-line no-descending-specificity */
  :global(a),
  :global(.item) {
    display: flex;
    align-items: center;
    color: var(--t);
    white-space: nowrap;
    cursor: pointer;

    :global(#bookmarks) & {
      padding: 0 13px;

      &:hover,
      &:focus { /* stylelint-disable-line no-descending-specificity */
        background-color: var(--c);
      }
    }
  }
</style>
