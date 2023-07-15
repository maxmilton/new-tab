import { compile } from 'stage1/macro' assert { type: 'macro' };
import { collect, h } from 'stage1/runtime';

type TestComponent = HTMLDivElement;

interface TestProps {
  text: string;
}

type Refs = {
  t: Text;
};

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
