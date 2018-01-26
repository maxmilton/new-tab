<!--
  TODO: Decide on and lock in the main feature set.
  TODO: Come up with a good name.
  TODO: Create app icons.
  TODO: Set up test framework and write tests.
  TODO: Update manifest in preparation for publishing..
  TODO: Publish on the Chrome web store.
  TODO: Add links to the extension in the Chrome web store (readme, changelog, github, etc.).
-->

# Chrome New Tab

A minimal and high performance Google Chrome new tab page (NTP) extension.

## Overview

This is an experimental project there's no set feature set yet. At the moment it's more of a chance for me to play with the Chrome browser APIs and experiment with performance optimisations.

Features:

* Access — you'll still have access to common links like your bookmarks bar etc.
* Speed — the default new tab page can be slow (it requires network requests etc. before one elements display) so a major focus area of this extension is performance. Page load performance, file size, and runtime performance are all scrupulously optimised.
* Privacy — most NTPs add user tracking scripts... not this one!
* Unobtrusive — doesn't add annoying things like entries to your right click context menu.

Technology:

* [Marko](https://markojs.com) JS framework
* CSS Grid

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
