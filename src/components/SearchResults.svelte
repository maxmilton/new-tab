<!--
  XXX: The h2 title is implemented abnormally to get around a current Svelte
  limitation where it creates multiple text nodes instead of realising there's
  multiple text nodes that could be combined into one. Once Svelte has this
  optimisation these titles should be refactored.
-->

<!-- FIXME: "Show more" doesn't work -->

<script>
  import LinkItem from './LinkItem.svelte';

  export let name;
  export let list;
  export let raw;

  const MORE_RESULTS_AMOUNT = 100;

  function loadMore() {
    list = raw.slice(0, list.length + MORE_RESULTS_AMOUNT);
  }
</script>

<h2>{`${name} (${list.length}/${raw.length})`}</h2>

{#each list as node}
  <LinkItem {node} />
{/each}

{#if name !== 'Top Sites' && list.length < raw.length}
  <button on:click="{loadMore}">Show more ▾</button>
{/if}
