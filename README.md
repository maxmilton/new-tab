<!-- markdownlint-disable first-line-h1 no-inline-html -->

[![Build status](https://img.shields.io/circleci/project/github/MaxMilton/new-tab.svg)](https://circleci.com/gh/MaxMilton/new-tab)
[![Coverage status](https://img.shields.io/codecov/c/github/MaxMilton/new-tab.svg)](https://codecov.io/gh/MaxMilton/new-tab)
[![Chrome web store version](https://img.shields.io/chrome-web-store/v/cpcibnbdmpmcmnkhoiilpnlaepkepknb.svg)](https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb)
[![Licence](https://img.shields.io/github/license/MaxMilton/new-tab.svg)](https://github.com/MaxMilton/new-tab/blob/master/LICENCE)

# New Tab

A high performance new tab page that gets you where you need to go faster. Utilises the latest tools and tech, packaged into a Google Chrome extension.

[![Add to Chrome](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_340x96.png)](https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb)

## Overview

I was left frustrated by the default Google Chrome new tab page experience. The "top sites" feature quickly outgrew its usefulness and I found myself using bookmarks instead every time. I never used the Google web search input either, as the search bar is all I need. I wondered... "If I could design my own new tab what would it look like?"... enter the `New Tab` extension.

Originally an experimental project to give me a chance for me to play with the Chrome browser APIs and explore web performance optimisations. This grew into something that actually improved my productivity and so, now `New Tab` is available for anyone to use.

### Features

* Minimal design aesthetic with multiple themes.
* See a list of your open tabs.
* Quickly search open tabs, bookmarks, history, and top sites in one place.
* Simple bookmarks bar.
* Links to common places in your browser.

### Motives

Issue | Why / How
--|--
Access | Still have access to common things like the bookmarks bar etc.
Speed | Near instant access to functionality. Page load performance, runtime performance, and file size should all be scrupulously optimised.
Privacy | No invasive user tracking scripts (unlike most other extensions).
Unobtrusive | No annoying things like entries in your right click menu.

### Technology

* [Svelte](https://svelte.technology) JavaScript framework
* [PostCSS](http://postcss.org)
* [Chrome browser APIs](https://developer.chrome.com/apps/api_index)

## Known issues

1. Not able to scroll in bookmark folders. This will be fixed soon.
1. The extension's bookmarks bar is limited in functionality. Chrome doesn't have an API to control the native bookmarks bar via extensions so I've recreated a simplistic version. The goal here is _high performance_ and not to emulate all the native bookmarks bar features. Use the bookmark manager.
1. Page needs to be reload after adding, editing, or removing bookmarks. Because bookmarks don't change often, I prefer not to add bookmark event listeners as most users simply don't need live bookmark changes.
1. Searching the browsing history is slow when you history is _very_ big. This is just a reality of Chrome. 😢

## Browser support

Each release will support the 2 latest versions of Google Chrome stable.

## Bugs

Please report any bugs you encounter on the [GitHub issue tracker](https://github.com/MaxMilton/new-tab/issues). Feature requests are welcome but keep in mind the goal is to keep things quite minimal and fast.

## Changelog

See [CHANGELOG.md](https://github.com/MaxMilton/new-tab/blob/master/CHANGELOG.md).

## Licence

`New Tab` is an MIT licensed open source project. See [LICENCE](https://github.com/MaxMilton/new-tab/blob/master/LICENCE).

-----

© 2018 [Max Milton](https://maxmilton.com)
