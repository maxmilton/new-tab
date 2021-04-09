import h from 'stage0';

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = HTMLAnchorElement;

interface RefNodes {
  img: HTMLImageElement;
  title: Text;
}

const linkView = h`
  <a>
    <img #img />
    #title
  </a>
`;

export function Link(item: LinkProps): LinkComponent {
  const root = linkView.cloneNode(true) as LinkComponent;
  const { img, title } = linkView.collect(root) as RefNodes;

  root.href = item.url;
  root.title = item.title;
  img.src = `chrome://favicon/${item.url}`;
  title.nodeValue = item.title;

  return root;
}
