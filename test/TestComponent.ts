import { h, S1Node } from 'stage1';

type TestComponent = S1Node & HTMLDivElement;

interface TestProps {
  text: string;
}

type RefNodes = {
  t: Text;
};

const view = h`
  <div id=test>
    #t
  </div>
`;

export function Test(props: TestProps): TestComponent {
  const root = view as TestComponent;
  const { t } = view.collect<RefNodes>(root);

  t.nodeValue = props.text;

  return root;
}
