// API setup
const API_BASE = "http://127.0.0.1:8000";
window.API_BASE = API_BASE;
  
function openSearchModal() {
  document.getElementById("searchOverlay").classList.add("active");
  document.getElementById("searchModal").classList.add("active");
  document.getElementById("searchInput").focus();
  document.getElementById("aiSummary").classList.add("hidden");
}

function closeSearchModal() {
  document.getElementById("searchOverlay").classList.remove("active");
  document.getElementById("searchModal").classList.remove("active");
}

function showAISummary() {
  var searchInput = document.getElementById("searchInput");
  var summaryBox = document.getElementById("aiSummary");
  var summaryContent = document.getElementById("aiSummaryContent");

  var question = String(searchInput.value || "").trim();
  if (question.length === 0) {
    alert("Please enter a search query first");
    return;
  }
//written by cursor to show the loading state
  summaryContent.innerHTML =
    '<div class="text-blue-600 text-sm">Generating AI summary...</div>';
  summaryBox.classList.remove("hidden");

  var url = API_BASE + "/resource/ai-summary";
  var payload = { question: question };
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    var summary = (data && data.summary) ? data.summary : "No summary available.";
    summaryContent.innerHTML =
      '<div class="text-blue-800 text-sm">' + summary + "</div>";
  });
}
// If the enter key of keyboard is pressed, show the AI summary, written by cursor
document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        showAISummary();
      }
    });
  }
});