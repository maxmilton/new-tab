import h from 'stage0';
// import { handleClick } from '../utils';

export interface LinkProps {}

const linkView = h`
  <a>
    <img #img />
    #title
  </a>
`;

export function Link(item: LinkProps) {
  const root = linkView.cloneNode(true);
  const { img, title } = linkView.collect(root);

  root.href = item.url;
  root.title = item.title;
  img.src = 'chrome://favicon/' + item.url;
  title.nodeValue = item.title;

  // root.__click = handleClick;

  return root;
}
