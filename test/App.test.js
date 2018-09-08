'use strict';

require('jest-canvas-mock');
const App = require('../src/App.html');

describe('App root component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new App({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});

describe('App click handler', () => {
  it('triggers on mouse click event', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    const component = new App({ target });
    const spy = jest.spyOn(component, '_onLinkClick');
    const event = new MouseEvent('click');
    window.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
    spy.mockReset();
    spy.mockRestore();
  });

  it('handles regular HTTP links', () => {
    expect.assertions(2);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="https://github.com/MaxMilton/new-tab/issues"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    spy1.mockReset();
    spy2.mockReset();
    spy1.mockRestore();
    spy2.mockRestore();
  });

  it('handles chrome internal links', () => {
    expect.assertions(4);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="chrome://bookmarks/"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    const spy3 = jest.spyOn(chrome.tabs, 'create', 'get');
    const spy4 = jest.spyOn(chrome.tabs, 'update', 'get');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    spy1.mockReset();
    spy2.mockReset();
    spy3.mockReset();
    spy4.mockReset();
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    spy4.mockRestore();
  });

  it('handles chrome internal links with _blank target', () => {
    expect.assertions(4);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="chrome://bookmarks/"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    Object.defineProperty(event.target, 'target', { value: '_blank', enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    const spy3 = jest.spyOn(chrome.tabs, 'create', 'get');
    const spy4 = jest.spyOn(chrome.tabs, 'update', 'get');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    spy1.mockReset();
    spy2.mockReset();
    spy3.mockReset();
    spy4.mockReset();
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    spy4.mockRestore();
  });

  it('handles chrome internal links with ctrl key', () => {
    expect.assertions(4);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="chrome://bookmarks/"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    const spy3 = jest.spyOn(chrome.tabs, 'create', 'get');
    const spy4 = jest.spyOn(chrome.tabs, 'update', 'get');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    spy1.mockReset();
    spy2.mockReset();
    spy3.mockReset();
    spy4.mockReset();
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    spy4.mockRestore();
  });
});
