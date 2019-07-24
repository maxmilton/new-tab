<!--
  TODO: Add padding to img if there is a textNode but try to do it without
  using JS based logic to keep the component logic free.
-->

<script>
  export let node;
</script>

<style type="text/postcss">
  /* All <img> are favicons */
  :global(img) {
    width: 16px;
    height: 16px; /* Prevents slight realignment jump on initial load */
    margin: 0 6px 0 0;
    pointer-events: none; /* Prevent being the click event target */
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
