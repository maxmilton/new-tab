import { spyOn } from 'nanospy';
import * as assert from 'uvu/assert';
import { DEFAULT_SECTION_ORDER, handleClick } from '../src/utils';
import { describe } from './utils';

describe('DEFAULT_SECTION_ORDER', (test) => {
  test('is an array', () => {
    assert.type(DEFAULT_SECTION_ORDER, 'object');
    assert.instance(DEFAULT_SECTION_ORDER, Array);
  });

  test('contains all sections', () => {
    assert.ok(DEFAULT_SECTION_ORDER.includes('Open Tabs'));
    assert.ok(DEFAULT_SECTION_ORDER.includes('Bookmarks'));
    assert.ok(DEFAULT_SECTION_ORDER.includes('History'));
    assert.ok(DEFAULT_SECTION_ORDER.includes('Top Sites'));
    assert.ok(DEFAULT_SECTION_ORDER.includes('Recently Closed Tabs'));
    assert.is(DEFAULT_SECTION_ORDER.length, 5);
  });

  test('contains no duplicates', () => {
    const uniqueSections = new Set(DEFAULT_SECTION_ORDER);
    assert.is(uniqueSections.size, DEFAULT_SECTION_ORDER.length);
  });

  test('has "Open Tabs" as the first item', () => {
    assert.is(DEFAULT_SECTION_ORDER[0], 'Open Tabs');
  });
});

// TODO: Add invarient tests for handleClick

describe('handleClick', (test) => {
  test('default prevented on event when url does not start with "h"', () => {
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about' };
    assert.not.ok(event.defaultPrevented, 'event default not prevented');
    handleClick(event);
    assert.ok(event.defaultPrevented, 'event default prevented');
  });

  test('default not prevent on event when url starts with "h"', () => {
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'https://example.com' };
    assert.not.ok(event.defaultPrevented, 'event default not prevented');
    handleClick(event);
    assert.not.ok(event.defaultPrevented, 'event default still not prevented');
  });

  test('opens in new tab when url starts with chrome:// and target is _blank', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about', target: '_blank' };
    handleClick(event);
    assert.ok(tabsCreateSpy.called, 'chrome.tabs.create called');
    assert.not.ok(tabsUpdateSpy.called, 'chrome.tabs.update not called');
  });

  test('opens in new tab when url starts with chrome:// and ctrl key is pressed', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click', { ctrlKey: true });
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about' };
    handleClick(event);
    assert.ok(tabsCreateSpy.called, 'chrome.tabs.create called');
    assert.not.ok(tabsUpdateSpy.called, 'chrome.tabs.update not called');
  });

  test('updates current tab when url starts with chrome:// and target is not _blank', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click');
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about', target: undefined };
    handleClick(event);
    assert.not.ok(tabsCreateSpy.called, 'chrome.tabs.create not called');
    assert.ok(tabsUpdateSpy.called, 'chrome.tabs.update called');
  });

  test('updates current tab when url starts with chrome:// and ctrl key is not pressed', () => {
    const tabsCreateSpy = spyOn(chrome.tabs, 'create');
    const tabsUpdateSpy = spyOn(chrome.tabs, 'update');
    const event = new window.MouseEvent('click', { ctrlKey: false });
    // @ts-expect-error - _target is an implementation detail of happy-dom
    event._target = { href: 'chrome://about' };
    handleClick(event);
    assert.not.ok(tabsCreateSpy.called, 'chrome.tabs.create not called');
    assert.ok(tabsUpdateSpy.called, 'chrome.tabs.update called');
  });
});
