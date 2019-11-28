<style type="text/postcss">
  :global(hr) {
    border: 0;
    border-bottom: 1px solid var(--c);
  }

  :global(.menu-item) {
    display: block;
    color: var(--t);
  }

  :global(#menu) {
    position: fixed;
    top: 90px;
    margin: -28px -84px -64px 0;
    padding: 10px 84px 84px 42px;
    font-size: 20px;
  }

  :global(#icon) {
    color: var(--c1);
    font-size: 30px;
  }

  :global(#dropdown) {
    position: absolute;
    top: 10px;
    z-index: 1;
    padding: 18px;
    white-space: nowrap;
    background: var(--c0);
    box-shadow: var(--s);
    opacity: 0;
    transition:
      opacity 160ms ease-out,
      transform 160ms ease-out;
    transform: scale(0.8);
    transform-origin: 0 10px;

    :global(#menu):hover > &,
    :global(#menu):focus > & {
      opacity: 1;
      transition-duration: 192ms;
      transform: scale(1);
    }
  }
</style>

<div id="menu">
  <div id="icon">☰</div>

  <div id="dropdown">
    <a href="chrome-search://local-ntp/local-ntp.html" class="menu-item">
      Open Default Tab
    </a>
    <a href="chrome://bookmarks/" class="menu-item">
      Bookmarks Manager
    </a>
    <a href="chrome://downloads/" class="menu-item">
      Downloads
    </a>
    <a href="chrome://history/" class="menu-item">
      History
    </a>
    <a href="chrome://settings/passwords" class="menu-item">
      Passwords
    </a>

    <hr>

    <!--
      Rather than using on:click + a method like normal, use an `id` and capture
      clicks in the global click event handler (in `common.js`). This way the
      entire component template is static and receives special optimisation.
    -->
    <a id="o" class="menu-item">
      New Tab Settings
    </a>
    <a href="https://github.com/MaxMilton/new-tab/issues" class="menu-item">
      Submit Bug
    </a>
  </div>
</div>
