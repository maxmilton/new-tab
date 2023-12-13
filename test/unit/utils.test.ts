import { describe, expect, mock, spyOn, test } from 'bun:test';
import { DEFAULT_SECTION_ORDER, handleClick } from '../../src/utils';

describe('DEFAULT_SECTION_ORDER', () => {
  test('is an array', () => {
    expect(DEFAULT_SECTION_ORDER).toBeInstanceOf(window.Array);
  });

  test('contains all sections', () => {
    expect(DEFAULT_SECTION_ORDER).toHaveLength(5);
    expect(DEFAULT_SECTION_ORDER).toContain('Open Tabs');
    expect(DEFAULT_SECTION_ORDER).toContain('Bookmarks');
    expect(DEFAULT_SECTION_ORDER).toContain('History');
    expect(DEFAULT_SECTION_ORDER).toContain('Top Sites');
    expect(DEFAULT_SECTION_ORDER).toContain('Recently Closed Tabs');
  });

  test('contains no duplicates', () => {
    const uniqueSections = new Set(DEFAULT_SECTION_ORDER);
    expect(uniqueSections.size).toBe(DEFAULT_SECTION_ORDER.length);
  });

  test('has "Open Tabs" as the first item', () => {
    expect(DEFAULT_SECTION_ORDER[0]).toBe('Open Tabs');
  });
});

// TODO: Add invarient tests for handleClick

describe('handleClick', () => {
  test('triggers click handler on target', () => {
    const event = new window.MouseEvent('click');
    const handler = mock(() => {});
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { __click: handler };
    handleClick(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  test('triggers click handler on target parent', () => {
    const event = new window.MouseEvent('click');
    const handler = mock(() => {});
    const child = document.createElement('div');
    const parent = document.createElement('a');
    parent.__click = handler;
    parent.appendChild(child);
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = child;
    handleClick(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  test('only triggers the first found click handler on target parents', () => {
    const event = new window.MouseEvent('click');
    const handler1 = mock(() => {});
    const handler2 = mock(() => {});
    const child = document.createElement('div');
    const parent1 = document.createElement('a');
    const parent2 = document.createElement('a');
    parent1.__click = handler1;
    parent2.__click = handler2;
    // parent2 > parent1 > child
    parent2.appendChild(parent1);
    parent1.appendChild(child);
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = child;
    handleClick(event);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledTimes(0);
  });

  // test.skip('default prevented on event when url does not start with "h"', () => {
  //   const event = new window.MouseEvent('click');
  //   // @ts-expect-error - _target is an implementation detail of happy-dom
  //   event._target = { href: 'chrome://about' };
  //   expect(event.defaultPrevented).toBe(false);
  //   handleClick(event);
  //   expect(event.defaultPrevented).toBe(true);
  // });

  test('default not prevented on event when url starts with "h"', () => {
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'https://example.com' };
    expect(event.defaultPrevented).toBe(false);
    handleClick(event);
    expect(event.defaultPrevented).toBe(false);
  });

  // returning false on click events is similar to event.preventDefault()
  test('handler returns false when url does not start with "h"', () => {
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about' };
    const result = handleClick(event);
    expect(result).toBe(false);
  });

  test('handler does not return false when url starts with "h"', () => {
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'https://example.com' };
    const result = handleClick(event);
    expect(result).not.toBe(false);
  });

  // TODO: If we add links with target="_blank" then don't skip this test.
  // test.skip('opens in new tab when url starts with chrome:// and target is _blank', () => {
  //   const tabsCreateSpy = spyOn(chrome.tabs, 'create');
  //   const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
  //   const event = new window.MouseEvent('click');
  //   // @ts-expect-error - _target is an implementation detail of happy-dom
  //   event._target = { href: 'chrome://about', target: '_blank' };
  //   handleClick(event);
  //   expect(tabsCreateSpy).toHaveBeenCalledTimes(1);
  //   expect(tabsCreateSpy).toHaveBeenCalledWith({ url: 'chrome://about' });
  //   expect(tabsUpdateSpy).toHaveBeenCalledTimes(0);
  //   tabsCreateSpy.mockRestore();
  //   tabsUpdateSpy.mockRestore();
  // });

  test('opens in new tab when url starts with chrome:// and ctrl key is pressed', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click', { ctrlKey: true });
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about' };
    handleClick(event);
    expect(tabsCreateSpy).toHaveBeenCalledTimes(1);
    expect(tabsCreateSpy).toHaveBeenCalledWith({ url: 'chrome://about' });
    expect(tabsUpdateSpy).toHaveBeenCalledTimes(0);
    tabsCreateSpy.mockRestore();
    tabsUpdateSpy.mockRestore();
  });

  test('updates current tab when url starts with chrome:// and target is not _blank', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about', target: undefined };
    handleClick(event);
    expect(tabsCreateSpy).toHaveBeenCalledTimes(0);
    expect(tabsUpdateSpy).toHaveBeenCalledTimes(1);
    expect(tabsUpdateSpy).toHaveBeenCalledWith({ url: 'chrome://about' });
    tabsCreateSpy.mockRestore();
    tabsUpdateSpy.mockRestore();
  });

  test('updates current tab when url starts with chrome:// and ctrl key is not pressed', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click', { ctrlKey: false });
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about' };
    handleClick(event);
    expect(tabsCreateSpy).toHaveBeenCalledTimes(0);
    expect(tabsUpdateSpy).toHaveBeenCalledTimes(1);
    expect(tabsUpdateSpy).toHaveBeenCalledWith({ url: 'chrome://about' });
    tabsCreateSpy.mockRestore();
    tabsUpdateSpy.mockRestore();
  });
});
