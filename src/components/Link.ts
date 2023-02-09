import { h, S1Node } from 'stage1';

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = S1Node & HTMLAnchorElement;

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
  nodes.i.src = 'chrome://favicon/' + item.url;
  nodes.t.nodeValue = item.title;

  return root;
};
