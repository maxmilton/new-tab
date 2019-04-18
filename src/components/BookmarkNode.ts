/* eslint-disable no-underscore-dangle */

import LinkItem from './LinkItem.svelte';
import BookmarkFolder from './BookmarkFolder.svelte';

// TODO: Use real svelte types once they're availiable
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function BookmarkNode(context: IComponentOptions) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return new (context.props!._node.children !== undefined
    ? BookmarkFolder
    : LinkItem)(context);
}
