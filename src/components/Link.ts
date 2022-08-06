import { h } from 'stage1';

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = HTMLAnchorElement;

type RefNodes = {
  i: HTMLImageElement;
  t: Text;
};

const view = h(`
  <a>
    <img decoding=async #i>
    #t
  </a>
`);

export const Link = (item: LinkProps): LinkComponent => {
  const root = view.cloneNode(true) as LinkComponent;
  const nodes = view.collect<RefNodes>(root);

  root.href = item.url;
  root.title = item.title;
  nodes.i.src = '_favicon?size=16&pageUrl=' + encodeURIComponent(item.url);
  nodes.t.nodeValue = item.title;

  return root;
};
