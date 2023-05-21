[![Build status](https://img.shields.io/github/actions/workflow/status/maxmilton/new-tab/ci.yml?branch=master)](https://github.com/maxmilton/new-tab/actions)
[![Coverage status](https://img.shields.io/codeclimate/coverage/maxmilton/new-tab)](https://codeclimate.com/github/maxmilton/new-tab)
[![Chrome Web Store version](https://img.shields.io/chrome-web-store/v/cpcibnbdmpmcmnkhoiilpnlaepkepknb.svg)](https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb)
[![Licence](https://img.shields.io/github/license/maxmilton/new-tab.svg)](https://github.com/maxmilton/new-tab/blob/master/LICENSE)

# New Tab ![](./static/icon48.png)

A high-performance browser new tab page that gets you where you need to go faster. Utilises the latest tools and tech, packaged into an easy to use Chrome browser extension.

[![Add to Chrome](https://storage.googleapis.com/chrome-gcs-uploader.appspot.com/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/mPGKYBIR2uCP0ApchDXE.png)](https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb)

## Overview

I was frustrated with the default Google Chrome new tab page experience. The "top sites" feature quickly outgrew its usefulness and I found myself using bookmarks instead every time. I never used the Google web search input either, as the search bar is all I need. I wondered, "If I could design my own new tab, what would it look like?"... enter the `New Tab` extension.

What started as an experiment to play with the Chrome browser APIs and explore web performance optimisations, `New Tab` has grown into something that genuinely improves my productivity. Maybe it can help you too!

### Features

- Fastest loading of any new tab page with all the features you expect.
- Distraction-free, minimal design aesthetic with multiple themes.
- A list of your open tabs, recently closed tabs, and top sites.
- Search tabs, bookmarks, history, and top sites in one place.
- Simple bookmarks bar.
- Links to frequently used destinations in your browser.

### Design goals

<!-- prettier-ignore -->
| Issue | Why / How |
| --- | --- |
| Access | Still have access to common things like the bookmarks bar etc. |
| Speed | Near-instant access to functionality. Page load performance, runtime performance, and file size should all be scrupulously optimised. |
| Privacy & Security | Zero user tracking (unlike most other extensions!). Very restrictive [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP). Local data only; no remote data fetching. |
| Unobtrusive | No annoying things like distracting colours, illegible text, or entries in your right-click menu. |

### Technology

- [Chrome browser APIs](https://developer.chrome.com/docs/extensions/reference/)
- [stage1](https://github.com/maxmilton/stage1) JavaScript framework
- [ekscss](https://github.com/maxmilton/ekscss) style preprocessor
- [esbuild](https://github.com/evanw/esbuild) JavaScript bundler
- [bun](https://github.com/oven-sh/bun) JavaScript bundler and runtime

## Browser support

Recent versions of Google Chrome and other Chromium-based browsers (e.g., Brave, Edge).

## Bugs

Report any bugs you encounter on the [GitHub issue tracker](https://github.com/maxmilton/new-tab/issues).

### Known issues

1. The extension's bookmarks bar functionality is limited. Browsers don't allow extensions to control the native bookmarks bar visibility, so the extension recreates a simple version. The goal is _high-performance_ and fast access rather than emulating the native bookmarks bar. Use the bookmark manager for access to all features.
1. The page needs to be reloaded after adding, editing, or removing bookmarks. The changes are not live because bookmarks don't change so often.

## Changelog

See [releases on GitHub](https://github.com/maxmilton/new-tab/releases).

## License

MIT license. See [LICENSE](https://github.com/maxmilton/new-tab/blob/master/LICENSE).

The [lightning bolt icon](https://github.com/twitter/twemoji/blob/master/assets/svg/26a1.svg) is from [twitter/twemoji](https://github.com/twitter/twemoji) which is licensed CC-BY 4.0.

---

© 2023 [Max Milton](https://maxmilton.com)
