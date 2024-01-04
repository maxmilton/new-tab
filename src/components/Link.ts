import { clone, collect, h } from 'stage1';
import { compile } from 'stage1/macro' assert { type: 'macro' };

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = HTMLAnchorElement;

type Refs = {
  i: HTMLImageElement;
  t: Text;
};

const meta = compile(`
  <a>
    <img @i decoding=async>
    @t
  </a>
`);
const view = h<LinkComponent>(meta.html);

export const Link = (props: LinkProps): LinkComponent => {
  const root = clone(view);
  const refs = collect<Refs>(root, meta.k, meta.d);

  refs.i.src =
    '_favicon?size=16&pageUrl=' + encodeURIComponent((root.href = props.url));
  // eslint-disable-next-line no-multi-assign
  root.title = refs.t.nodeValue = props.title;

  return root;
};
