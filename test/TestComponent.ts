import { collect, h } from 'stage1';
import { compile } from 'stage1/macro' with { type: 'macro' };

type TestComponent = HTMLDivElement;

interface TestProps {
  text: string;
}

interface Refs {
  t: Text;
}

const meta = compile(`
  <div id=test>
    @t
  </div>
`);
const view = h<HTMLDivElement>(meta.html);

export function Test(props: TestProps): TestComponent {
  const root = view;
  const refs = collect<Refs>(root, meta.k, meta.d);

  refs.t.nodeValue = props.text;

  return root;
}
