<!--
  TODO: Decide on and lock in the main feature set.
  TODO: Come up with a good name.
  TODO: Create app icons.
  TODO: Set up test framework and write tests.
  TODO: Update manifest in preparation for publishing..
  TODO: Publish on the Chrome web store.
  TODO: Add links to the extension in the Chrome web store (readme, changelog, github, etc.).
-->

# New Tab

A minimal and high performance Google Chrome new tab page (NTP) extension.

## Overview

This is an experimental project there's no set feature set yet. At the moment it's more of a chance for me to play with the Chrome browser APIs and experiment with performance optimisations.

Features:

* Access — you'll still have access to common links like your bookmarks bar<sup>[*1](#Known%20issues)</sup> etc.
* Speed — the default new tab page can be slow (it requires network requests etc. before some elements display) but a major focus area of this extension is performance. Page load performance, file size, and runtime performance are all scrupulously optimised.
* Privacy — most NTPs add user tracking scripts... not this one!
* Unobtrusive — doesn't add annoying things like entries to your right click context menu.

Technology:

* [Marko](https://markojs.com) JS framework
* CSS Grid

## Known issues

1. There's no overflow menu for the bookmarks bar. I haven't been able to achieve recreate this the level performance I wanted so I've purposely left this out. See the next point for the reason why.
  * Use the native bookmarks bar or limit the number of bookmarks in your bookmarks bar folder (it's nice to have it minimalistic anyway!).
1. The extension's bookmarks bar is lacking in functionality. Chrome doesn't have any API to control the native bookmarks bar via extensions so I've recreated a simplistic version.
1. The page needs to be reloaded after add, editing, or removing bookmarks on the bookmarks bar. Because the bookmarks bar doesn't change so often, I prefer not to add bookmark event listeners as it would use a small amount of memory and most users simply don't need this.

## Browser support

Each release will support only the 2 latest major versions of Google Chrome and Chromium.

## Bugs

Please report any bugs you run into on the [GitHub issue tracker](https://github.com/MaxMilton/chrome-new-tab/issues). Feature requests are welcome but keep in mind the goal is to keep things quite minimal.

## Changelog

See [CHANGELOG.md](https://github.com/MaxMilton/chrome-new-tab/blob/master/CHANGELOG.md).

## Licence

`chrome-new-tab` is an MIT licensed open source project. See [LICENCE](https://github.com/MaxMilton/chrome-new-tab/blob/master/LICENCE).

-----

© 2018 [Max Milton](https://maxmilton.com)
