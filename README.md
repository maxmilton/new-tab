<!--
  TODO: Create app icons.
  TODO: Add screenshots to web store.
  TODO: Set up test framework and write tests.
-->

# New Tab

A high performance new tab page that gets you where you need to go faster. Utilises the latest tools and tech, packaged into a Google Chrome extension.

[![Add to Chrome](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_340x96.png)](https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb)

## Overview

I was left frustrated by the default Google Chrome new tab page experience. The "top sites" feature quickly outgrew its usefulness and I found myself using bookmarks instead every time. I never used the Google web search input either, as the omnibar is all I need. I wondered... "If I could design my own new tab what would it look like?"... enter the `New Tab` extension.

Originally an experimental project to give me a chance for me to play with the Chrome browser APIs and explore web performance optimisations. It grew into something that actually improved my productivity and so, now `New Tab` is available for anyone to use.

### Features

* Minimal, dark aesthetic.
* See a list of your open tabs.
* Quickly search open tabs, bookmarks, and history in one place.
* Simple bookmarks bar.
* Links to common places in your browser.

### Motives

Issue | Why / How
--|--
Access | Still have access to common things like the bookmarks bar<sup>[*1](#known-issues)</sup> etc.
Speed | Functionality should be available near instantly. Page load performance, file size, and runtime performance should all be scrupulously optimised.
Privacy | Most NTPs add user tracking scripts... not this one!
Unobtrusive | Doesn't add annoying things like entries to your right click context menu.

### Technology

* [Marko](https://markojs.com) JavaScript framework
* [PostCSS](http://postcss.org/)
* [Lasso](https://github.com/lasso-js/lasso) resource bundler
* [Chrome browser APIs](https://developer.chrome.com/apps/api_index)

## Known issues

1. There's no overflow menu for the bookmarks bar. I haven't been able to implement this the level performance I'm after from the extension so this is purposely left out.
    * _Workaround:_ Limit the number of bookmarks in your bookmarks bar folder or group your bookmarks into folders (it's nice to have it clean and minimal anyway!).
1. The extension's bookmarks bar is lacking in functionality. Chrome doesn't have an API to control the native bookmarks bar via extensions so I've recreated a simplistic version.
1. The page needs to be reloaded after add, editing, or removing bookmarks on the bookmarks bar. Because the bookmarks bar doesn't change so often, I prefer not to add bookmark event listeners as most users simply don't need this.
1. Searching your Chrome browsing history can be slow if you history is _very_ big. This is just a reality of Chrome.

## Browser support

Each release will support the 2 latest versions of Google Chrome.

## Bugs

Please report any bugs you encounter on the [GitHub issue tracker](https://github.com/MaxMilton/new-tab/issues). Feature requests are welcome but keep in mind the goal is to keep things quite minimal and fast.

## Changelog

See [CHANGELOG.md](https://github.com/MaxMilton/new-tab/blob/master/CHANGELOG.md).

## Licence

`New Tab` is an MIT licensed open source project. See [LICENCE](https://github.com/MaxMilton/new-tab/blob/master/LICENCE).

-----

© 2018 [Max Milton](https://maxmilton.com)
