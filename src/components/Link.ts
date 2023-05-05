import { h } from 'stage1';

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = HTMLAnchorElement;

type Refs = {
  i: HTMLImageElement;
  t: Text;
};

const view = h(`
  <a>
    <img decoding=async #i>
    #t
  </a>
`);

export const Link = (props: LinkProps): LinkComponent => {
  const root = view.cloneNode(true) as LinkComponent;
  const nodes = view.collect<Refs>(root);

  root.href = props.url;
  // eslint-disable-next-line no-multi-assign
  root.title = nodes.t.nodeValue = props.title;
  nodes.i.src = '_favicon?size=16&pageUrl=' + encodeURIComponent(props.url);

  return root;
};
