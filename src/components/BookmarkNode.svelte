<script>
  import LinkItem from './LinkItem.svelte';
  import BookmarkFolder from './BookmarkFolder.svelte';
</script>

{#if $$props._node.children !== undefined}
  <BookmarkFolder {...$$props} />
{:else}
  <LinkItem {...$$props} />
{/if}
