<!-- markdownlint-disable no-duplicate-header no-inline-html -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2018-04-30

### Added

- Top sites are now also listed in search.

### Changed

- Complete rewrite from `Marko.js` to [`Svelte`](https://svelte.technology/guide#refs). After constant issues with marko I decided it was time for a change. Svelte works great for this use case and now not only is the extension faster and bundle files smaller, it's overcome all the extension's bugs.

### Fixed

- Search input not triggering search.
- Pressing `ESC` doesn't clear search.
- Bookmark item title incorrect when hovering subfolder items.
- Build process fails in new nodejs versions.

Known issues:

- Having too many bookmarks in the bookmark bar is still a problem.
- When sites don't have correct caching headers set up on their favicons it can delay fetching the other favicon images on page load. This causes a tiny but noticeable flash of favicon images.

## [0.5.1] - 2018-04-30

### Added

- Initial test suite and testing automation setup.

### Fixed

- Temporarily disable JS advanced property mangling to prevent any related errors.

### Changed

- Move main JavaScript bundle to higher for a small performance improvement.
- Use a background script instead of a background page and set up an event handler for new installs and updates which saves the default settings.
- Build process improvements.
- Update dependencies.
- Developer tooling configuration tweaks.

## [0.5.0] - 2018-02-13

### Added

- Experimental background page, which does nothing itself, but should keep the extension in memory.
- Tweaked extension manifest; now disallowed in incognito.

### Fixed

- Initial load time slow causing a flash of white unstyled page. Likely due to the extension not being in memory.

## [0.4.1] - 2018-02-13

### Fixed

- Incorrect CSP hash in extension manifest.

## [0.4.0] - 2018-02-13

### Added

- Themes! Now comes with light, dark, and black. The dark was also improved and is still the default option.
- Dedicated settings page. With the new themes it would be too cluttered to have the settings in the NTP itself. It also means there's slightly less computation when loading the NTP.

### Changed

- Settings now sync to your account.
- Improved file loader to handle themes.
- Some internal improvements to make the file size a tiny bit smaller and faster to parse.
- Make build steps more generic; modularise minification, simplify HTML template.
- Other general build improvements.

## [0.3.2] - 2018-02-09

### Added

- Release automation script.

### Changed

- Shorter code banner.
- More JavaScript minification tweaks for even smaller file size.
- Error reporting improvements.

## [0.3.1] - 2018-02-07

### Fixed

- "Load more" bug in search results.

### Changed

- Use Marko event system to trigger bookmark folder close for better efficiency than browser native events.
- Simplify logic for opening a bookmark folder to the left; avoids a bunch of complex calculations on every folder open.
- Custom JavaScript object property mangling for even more file size savings.
- Small development watch script CLI feedback improvement.

## [0.3.0] - 2018-02-05

### Added

- Better handle when to open and close bookmark folders for a smoother experience.
- Error tracking. Async and non-invasive. Since the performance impact is low it's also on by default but is easy to opt-out of.

### Fixed

- Menu animation no longer stutters.
- Menu is a bit more usable on small screens.
- Bug where the document is loaded multiple times due to an incorrect `<img>` src attribute.

### Changed

- Higher priority main JavaScript file loading for better load performance.
- Better CSS minification for smaller code final size and faster browser parsing.
- Build and development process improvements.
- Tighter <abbr title="Content Security Policy">CSP</abbr> than Chrome defaults for better security.
- JavaScript bundle size reductions.
- General code clean up.

## [0.2.0] - 2018-02-04

### Added

- Now published on the Google Chrome web store: <https://chrome.google.com/webstore/detail/new-tab/cpcibnbdmpmcmnkhoiilpnlaepkepknb>.
- Search now also finds matches in your browsing history.
- Subtle shadows to show depth and highlight areas of interest.
- New menu items and menu open animation.
- Listen to tab events and update tabs list when something changes.
- Show message when there are no matching search results for a category.
- Wrote a better readme.

### Fixed

- Bookmark folders open to the right if there's not enough space to show the folder in the window.
- Debounce search input to help prevent layout thrashing when search results appear.
- Add `title` attribute to bookmarks to view long bookmark titles on hover.

### Changed

- Renamed all files and directories for consistency.
- A more logical file layout including most Marko components as single files rather than directories with multiple files.
- Better build flow.
- Performance improvements:
  - Inline CSS in HTML + add minimal page markup to template for near-instant initial page load.
  - Better minification in builds — even though Chrome extensions serve local files from the filesystem, minification still improves browser parsing times.
  - Short CSS classes for faster DOM parsing and matching.
  - Set many elements as `no-update` for much faster Marko rendering passes.
  - Use `key` on repeating elements for faster rendering when elements move in the DOM (e.g. during search/filtering).
- Clean up, improve, and move build scripts into `/build`.

### Removed

- Dependency `fast-memoize` as the benefit was not really there.

## 0.1.0 - 2018-01-25

### Added

- Initial public version including all the basics; working proof of concept code, readme, etc. Not ready for release yet though, it's still far from being actually useful!

[Unreleased]: https://github.com/MaxMilton/new-tab/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/MaxMilton/new-tab/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/MaxMilton/new-tab/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/MaxMilton/new-tab/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/MaxMilton/new-tab/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/MaxMilton/new-tab/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/MaxMilton/new-tab/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MaxMilton/new-tab/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/MaxMilton/new-tab/compare/v0.1.0...v0.2.0
