import h, { HNode } from 'stage0';

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = HNode<HTMLAnchorElement>;

interface RefNodes {
  img: HTMLImageElement;
  title: Text;
}

const view = h`
  <a><img #img />#title</a>
`;

export function Link(item: LinkProps): LinkComponent {
  const root = view.cloneNode(true) as LinkComponent;
  const { img, title } = view.collect(root) as RefNodes;

  root.href = item.url;
  root.title = item.title;
  img.src = `chrome://favicon/${item.url}`;
  title.nodeValue = item.title;

  return root;
}
