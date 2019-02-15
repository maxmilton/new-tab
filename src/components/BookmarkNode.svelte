<svelte:options bind:props />

<script>
  import LinkItem from './LinkItem.svelte';
  import BookmarkFolder from './BookmarkFolder.svelte';

  let props;
</script>

{#if props._node.children !== undefined}
  <!-- htmlmin:ignore -->
  <BookmarkFolder {...props} /><!-- htmlmin:ignore -->
{:else}
  <!-- htmlmin:ignore -->
  <LinkItem {...props} /><!-- htmlmin:ignore -->
{/if}
