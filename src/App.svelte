<script>
  import { handleLinkClick } from './utils';
  import BookmarksBar from './components/BookmarksBar.svelte';
  import Menu from './components/Menu.svelte';
  import Search from './components/Search.svelte';
</script>

<style type="text/postcss">
  @import './themes/light.css';
  @import './themes/dark.css';

  :global(body) { /* stylelint-disable-line a11y/line-height-is-vertical-rhythmed */
    margin: 110px 0;
    overflow-y: scroll; /* Prevent jump on load */
    font-size: 18px;
    /**
     * Normally you would use a unitless value for line-height but this is kind
     * of a hack for alignment with the minimum possible style properties. Same
     * as bookmark bar height.
     */
    line-height: 41px;
    text-rendering: optimizeSpeed;
    font-variant-ligatures: none;
    background-color: var(--b);
  }

  :global(h2),
  :global(.muted) {
    color: var(--c1);
  }

  :global(a) { /* stylelint-disable-line no-descending-specificity */
    text-decoration: none;

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
</style>

<svelte:window on:click={handleLinkClick}/>

<BookmarksBar/>
<Search/>
<Menu/>
