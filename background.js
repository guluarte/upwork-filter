// Required for manifest v3
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ minRating: 4.0, minSpend: 10000 });
});
