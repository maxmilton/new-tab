<script>
  let seconds = 0;

  const numFormat = new Intl.NumberFormat();
  const secondsPerDay = 86400; // 24 hours * 60 minutes * 60 seconds;

  setInterval(() => {
    const now = new Date();
    const secondsPassed = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    seconds = numFormat.format(secondsPerDay - secondsPassed);
  }, 1e3);
</script>

<div class="time-left">
  <code>{seconds}</code> seconds left in the day
</div>

<style lang="xcss">
  :global(.time-left) {
    position: absolute;
    right: 2em;
    top: 6em;
    color: var(--t);
  }
</style>
