<!--
  TODO: Try to accomplish the same short text like shorten() but with CSS only
  and without  adding any wrapper elements.

  TODO: Add padding to img if there is a textNode but try to do it without
  using JS based logic to keep the component logic free.
-->

<script>
  /* eslint-disable no-underscore-dangle */
  export let node;
</script>

<style type="text/postcss">
  /* all <img> are favicons */
  :global(img) {
    width: 16px;
    height: 16px; /* prevents slight realignment jump on initial load */
    margin: 0 6px 0 0;
    pointer-events: none; /* prevent being the click event target */
  }

  :global(a),
  :global(.item) {
    display: block;
    color: var(--t);
    white-space: nowrap;
    cursor: pointer;
  }
</style>

<a href="{node.url}" title="{node.title}">
  <img src="chrome://favicon/{node.url}">
  {node.title}
</a>
