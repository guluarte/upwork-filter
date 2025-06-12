// Required for manifest v3
console.log('background.js: Extension installed');

chrome.runtime.onInstalled.addListener(() => {
  console.log('background.js: Setting default values');
  chrome.storage.sync.set({ minRating: 4.5, minSpend: 1000, keywords: "" });
});
