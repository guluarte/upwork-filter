// Updated content.js with correct selectors
console.log("content.js: Script loaded");
let observer;
let currentSettings = {};
let settingsLoaded = false;

// Set up observer first to catch DOM changes while settings load
observer = new MutationObserver(() => {
  console.log("content.js: MutationObserver triggered");
  if (settingsLoaded) {
    console.log("content.js: Triggering applyFilters from observer");
    applyFilters();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

chrome.storage.sync.get(["minRating", "minSpend", "keywords"], (data) => {
  console.log("content.js: Initial settings loaded", data);
  currentSettings = {
    minRating: data.minRating || 4.0,
    minSpend: data.minSpend || 1000,
    keywords: data.keywords || "",
  };
  settingsLoaded = true;
  applyFilters();
});

chrome.storage.onChanged.addListener((changes) => {
  console.log("content.js: Storage changed", changes);
  if (changes.minRating) currentSettings.minRating = changes.minRating.newValue;
  if (changes.minSpend) currentSettings.minSpend = changes.minSpend.newValue;
  if (changes.keywords) currentSettings.keywords = changes.keywords.newValue;
  applyFilters();
});

function applyFilters() {
  // Disconnect observer to prevent recursive triggers
  observer.disconnect();

  console.log("content.js: applyFilters started");
  console.log(
    `content.js: Current settings - minRating: ${currentSettings.minRating}, minSpend: ${currentSettings.minSpend}, keywords: '${currentSettings.keywords}'`,
  );
  const jobCards = document.querySelectorAll(
    "[data-test='job-tile-list'] > section.air3-card-section, article[data-ev-label='search_results_impression']",
  );

  jobCards.forEach((card, index) => {
    console.log(`content.js: Processing card ${index + 1}/${jobCards.length}`);
    const ratingElement =
      card.querySelector(".air3-rating-background .sr-only") ??
      card.querySelector(".air3-rating-value-text");

    const spendElement =
      card.querySelector('[data-test="formatted-amount"]') ??
      card.querySelector('[data-test="total-spent"]');
    const titleElement =
      card.querySelector('[data-test="job-title"]') ??
      card.querySelector(".job-tile-title");

    const descriptionElement =
      card.querySelector('[data-test="job-description-text"]') ??
      card.querySelector(".job-description");

    let reasons = [];

    // Rating filtering
    if (currentSettings.minRating) {
      const ratingText = ratingElement?.textContent || "";
      const ratingMatch = ratingText.match(/(\d+\.\d+)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      if (rating < currentSettings.minRating) {
        reasons.push(`Rating: ${rating} < ${currentSettings.minRating}`);
      }
    }

    // Spend filtering
    if (currentSettings.minSpend) {
      const spendText = spendElement?.textContent?.trim() || "$0";
      const spend = parseSpend(spendText);
      if (spend < currentSettings.minSpend) {
        reasons.push(`Spend: $${spend} < $${currentSettings.minSpend}`);
      }
    }

    // Keyword filtering
    if (currentSettings.keywords && currentSettings.keywords.trim()) {
      const keywords = currentSettings.keywords
        .split(",")
        .map((kw) => kw.trim().toLowerCase());
      const title = titleElement?.textContent?.toLowerCase() || "";
      const description = descriptionElement?.textContent?.toLowerCase() || "";

      for (const keyword of keywords) {
        if (
          keyword &&
          (title.includes(keyword) || description.includes(keyword))
        ) {
          reasons.push(`Contains keyword: ${keyword}`);
          break;
        }
      }
    }

    if (reasons.length > 0) {
      console.log(
        `content.js: Hiding card ${index + 1} - Reasons: ${reasons.join("; ")}`,
      );
      card.style.opacity = "0.5";

      // Add/update reason display
      let reasonDisplay = card.querySelector(".filter-reason");
      if (!reasonDisplay) {
        reasonDisplay = document.createElement("div");
        reasonDisplay.className = "filter-reason";
        reasonDisplay.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px;
          font-size: 12px;
          z-index: 10;
        `;
        card.style.position = "relative";
        card.appendChild(reasonDisplay);
      }
      reasonDisplay.textContent = `Hidden: ${reasons.join("; ")}`;
    } else {
      console.log(`content.js: Card ${index + 1} passed all filters`);
      card.style.opacity = "1";
      // Remove reason display if exists
      const reasonDisplay = card.querySelector(".filter-reason");
      if (reasonDisplay) reasonDisplay.remove();
    }
  });
  console.log(`content.js: Processed ${jobCards.length} cards`);

  // Reconnect observer after DOM updates
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
}

function parseSpend(text) {
  console.log(`content.js: Parsing spend text: '${text}'`);
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

  console.log(`content.js: Parsed spend value: ${amount * multiplier}`);
  return amount * multiplier;
}
