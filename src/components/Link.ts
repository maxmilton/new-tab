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
  const refs = view.collect<Refs>(root);

  root.href = props.url;
  // eslint-disable-next-line no-multi-assign
  root.title = refs.t.nodeValue = props.title;
  refs.i.src = '_favicon?size=16&pageUrl=' + encodeURIComponent(props.url);

  return root;
};
