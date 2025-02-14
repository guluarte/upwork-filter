// Required for manifest v3
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ minRating: 4.5, minSpend: 1000 });
});
