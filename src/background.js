/**
 * XXX: When settings are undefined they will drop back to the defaults and so
 * don't need to be explicitly set. This file can be used if the defaults need to
 * be changed for all users.
 */

// // initialise or update default settings and save to user account
// chrome.runtime.onInstalled.addListener((details) => {
//   if (details.reason === 'install' || details.reason === 'update') {
//     chrome.storage.sync.get(null, (settings) => {
//       const newSettings = {};

//       // theme default
//       if (settings.t === undefined) {
//         newSettings.t = 'dark'; // dark theme
//       }

//       // error tracking default
//       if (settings.e === undefined) {
//         newSettings.e = false; // not opt-out
//       }

//       chrome.storage.sync.set(newSettings);
//     });
//   }
// });
