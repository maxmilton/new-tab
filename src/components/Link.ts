import { clone, h } from "stage1/fast";
import { compile } from "stage1/macro" with { type: "macro" };

export interface LinkProps {
  title: string;
  url: string;
}

export type LinkComponent = HTMLAnchorElement;

interface Refs {
  img: HTMLImageElement;
  text: Text;
}

const meta = compile(`
  <a>
    <img @img decoding=async>
    @text
  </a>
`);
const view = h<LinkComponent>(meta.html);

export const Link = (props: LinkProps): LinkComponent => {
  const root = clone(view);

  // Access DOM nodes directly (without stage1 collect function) to improve
  // performance. This component is rendered frequently so keep overhead low.

  (root.firstChild as Refs["img"]).src = "_favicon?size=16&pageUrl=" + encodeURIComponent(root.href = props.url);
  // oxlint-disable-next-line no-multi-assign
  root.title = (root.lastChild as Refs["text"]).nodeValue = props.title;

  return root;
};
