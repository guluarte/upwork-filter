document.addEventListener("DOMContentLoaded", () => {
  // Load saved settings
  chrome.storage.sync.get(["minRating", "minSpend"], (data) => {
    document.getElementById("minRating").value = data.minRating || 4.0;
    document.getElementById("minSpend").value = data.minSpend || 10000;
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

  function updateDisplays() {
    const rating = document.getElementById("minRating").value;
    const spend = document.getElementById("minSpend").value;
    document.getElementById("ratingValue").textContent = rating;
    document.getElementById("spendValue").textContent =
      spend >= 1000 ? `${spend / 1000}k` : spend;
  }
});
