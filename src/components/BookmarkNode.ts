import { SvelteComponent } from 'svelte/internal'; // eslint-disable-line import/no-extraneous-dependencies
import LinkItem from './LinkItem.svelte';
import BookmarkFolder from './BookmarkFolder.svelte';

export default (context: ComponentOptions): SvelteComponent =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  new (context.props!.node.children !== undefined ? BookmarkFolder : LinkItem)(
    context,
  );
