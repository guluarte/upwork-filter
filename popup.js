document.addEventListener("DOMContentLoaded", () => {
  // Load saved settings
  chrome.storage.sync.get(["minRating", "minSpend", "keywords"], (data) => {
    document.getElementById("minRating").value = data.minRating || 4.0;
    document.getElementById("minSpend").value = data.minSpend || 10000;
    document.getElementById("keywords").value = data.keywords || "";
    updateDisplays();
  });

  // Rating input handler
  document.getElementById("minRating").addEventListener("input", (e) => {
    document.getElementById("ratingValue").textContent = e.target.value;
    chrome.storage.sync.set({ minRating: parseFloat(e.target.value) });
  });

  // Spend input handler
  document.getElementById("minSpend").addEventListener("input", (e) => {
    const spend = parseInt(e.target.value);
    document.getElementById("spendValue").textContent =
      spend >= 1000 ? `${spend / 1000}k` : spend;
    chrome.storage.sync.set({ minSpend: spend });
  });

  // Keywords input handler
  document.getElementById("keywords").addEventListener("input", (e) => {
    const keywords = e.target.value;
    document.getElementById("keywordsValue").textContent = keywords || "";
    chrome.storage.sync.set({ keywords });
  });

  function updateDisplays() {
    const rating = document.getElementById("minRating").value;
    const spend = document.getElementById("minSpend").value;
    const keywords = document.getElementById("keywords").value;
    
    document.getElementById("ratingValue").textContent = rating;
    document.getElementById("spendValue").textContent =
      spend >= 1000 ? `${spend / 1000}k` : spend;
    document.getElementById("keywordsValue").textContent = keywords || "all";
  }
});
