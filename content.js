// Updated content.js with correct selectors
let observer;
let currentSettings = {};

chrome.storage.sync.get(["minRating", "minSpend"], (data) => {
  currentSettings = data;
  applyFilters();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.minRating) currentSettings.minRating = changes.minRating.newValue;
  if (changes.minSpend) currentSettings.minSpend = changes.minSpend.newValue;
  applyFilters();
});

function applyFilters() {
  const jobCards = document.querySelectorAll(
    "[data-test='job-tile-list'] > section.air3-card-section, article[data-ev-label='search_results_impression']",
  );

  jobCards.forEach((card) => {
    const ratingElement =
      card.querySelector(".air3-rating-background .sr-only") ??
      card.querySelector(".air3-rating-value-text");

    const spendElement =
      card.querySelector('[data-test="formatted-amount"]') ??
      card.querySelector('[data-test="total-spent"]');
    let shouldHide = false;

    // Rating filtering
    if (currentSettings.minRating) {
      const ratingText = ratingElement?.textContent || "";
      const ratingMatch = ratingText.match(/(\d+\.\d+)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      if (rating < currentSettings.minRating) {
        shouldHide = true;
      }
    }

    // Spend filtering
    if (currentSettings.minSpend) {
      const spendText = spendElement?.textContent?.trim() || "$0";
      const spend = parseSpend(spendText);
      if (spend < currentSettings.minSpend) {
        shouldHide = true;
      }
    }

    card.style.opacity = shouldHide ? "0.5" : "1";
  });
}

function parseSpend(text) {
  const cleanText = text
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\+/g, "");
  const matches = cleanText.match(/(\d+\.?\d*)(k|m)?/i);
  if (!matches) return 0;

  const amount = parseFloat(matches[1]);
  const multiplier =
    matches[2]?.toLowerCase() === "k"
      ? 1000
      : matches[2]?.toLowerCase() === "m"
        ? 1000000
        : 1;

  return amount * multiplier;
}

// MutationObserver remains the same
observer = new MutationObserver((mutations) => {
  applyFilters();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});
