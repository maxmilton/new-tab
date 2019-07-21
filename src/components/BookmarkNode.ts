import { SvelteComponent } from 'svelte/internal'; // eslint-disable-line import/no-extraneous-dependencies
import LinkItem from './LinkItem.svelte';
import BookmarkFolder from './BookmarkFolder.svelte';

export default function BookmarkNode(
  context: SvelteComponent['$$'],
): SvelteComponent {
  return new (context.props.node.children ? BookmarkFolder : LinkItem)(
    // @ts-ignore
    context,
  );
}
