import { JSDOM, VirtualConsole } from 'jsdom';

const oldGlobal = global;
const oldConsole = console;
// const mountedContainers = new Set();

export function setup(): void {
  const dom = new JSDOM('<!DOCTYPE html>', {
    // pretendToBeVisual: true,
    // runScripts: 'dangerously',
    // url: 'http://localhost',
    // virtualConsole: new VirtualConsole().sendTo(console),
    virtualConsole: new VirtualConsole().sendTo(oldConsole),
  });

  // @ts-expect-error - Intentionally overriding global
  // eslint-disable-next-line no-global-assign
  global = dom.window.document.defaultView;
  global.global = oldGlobal;

  console.log('SETUP DONE');
  // console.log(global);
  // console.log(global.global);
}

export function render(component: Element) {
  const container = document.createElement('div');

  container.appendChild(component);
  document.body.appendChild(container);

  // mountedContainers.add({ container });

  return {
    container,
    debug() {
      // console.log(container.outerHTML);
      oldConsole.log('DEBUG:');
      oldConsole.log(container.outerHTML);
    },
  };
}

export function cleanup(): void {
  document.body.innerText = '';

  // mountedContainers.forEach(({ container }) => {
  //   if (container.parentNode === document.body) {
  //     document.body.removeChild(container);
  //   }
  // });
}
