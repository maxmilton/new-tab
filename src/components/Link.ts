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
  // eslint-disable-next-line no-multi-assign
  root.title = nodes.t.nodeValue = item.title;
  nodes.i.src = '_favicon?size=16&pageUrl=' + encodeURIComponent(item.url);

  return root;
};
