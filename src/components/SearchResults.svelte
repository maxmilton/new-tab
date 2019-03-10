<!--
  XXX: The h2 title is implemented abnormally to get around a current Svelte
  limitation where it creates multiple text nodes instead of realising there's
  multiple text nodes that could be combined into one. Once Svelte has this
  optimisation these titles should be refactored.
-->

<script>
  import LinkItem from './LinkItem.svelte';

  // props
  export let resultsName;
  export let resultsList;
  export let resultsRaw;

  const MORE_RESULTS_AMOUNT = 100;

  /** @param {number} length Current length of list. */
  function loadMore(length) {
    resultsList = resultsRaw.slice(0, length + MORE_RESULTS_AMOUNT);
  }
</script>

<h2>{`${resultsName} (${resultsList.length}/${resultsRaw.length})`}</h2>

{#each resultsList as _node}
  <LinkItem {_node} />
{/each}

{#if resultsName !== 'Top Sites' && resultsList.length < resultsRaw.length}
  <button on:click="{() => loadMore(resultsList.length)}">Show more ▾</button>
{/if}
