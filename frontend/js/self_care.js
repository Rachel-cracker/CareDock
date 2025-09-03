// Ensure API_BASE is defined
if (typeof window.API_BASE === 'undefined') {
  window.API_BASE = "http://localhost:8000";
}
var activeDropdown = null;
var allCards = [];

//switch the filter dropdown written by cursor
//To avoid open both dropdowns at the same time which cause the dropdowns to overlap
function toggleFilterDropdown(type) {
  var dropdown = document.getElementById(type + "Dropdown");
  if (!dropdown) return;

  if (activeDropdown && activeDropdown !== dropdown) {
    activeDropdown.classList.add("hidden");
  }
  // toggle current
  if (dropdown.classList.contains("hidden")) {
    dropdown.classList.remove("hidden");
    activeDropdown = dropdown;
  } else {
    dropdown.classList.add("hidden");
    activeDropdown = null;
  }
}

function hideActiveDropdown() {
  if (activeDropdown) {
    activeDropdown.classList.add("hidden");
    activeDropdown = null;
  }
}

//get the selected filters
function getSelectedFilters(dropdownSelector) {
  var dropdown = document.querySelector(dropdownSelector);
  if (!dropdown) return [];
  //get the checked checkboxes
  var checked = dropdown.querySelectorAll('input[type="checkbox"]:checked');
  var values = [];
  for (var i = 0; i < checked.length; i++) {
    values.push(checked[i].value);
  }
  return values;
}

function applyFilters() {
  var selectedMediaTypes = getSelectedFilters("#mediaTypeDropdown");
  var selectedTags = getSelectedFilters("#tagDropdown");

  var filtered = [];
  //if no filters are selected, show all cards
  if (selectedMediaTypes.length === 0 && selectedTags.length === 0) {
    filtered = allCards;
  } else {
    for (var i = 0; i < allCards.length; i++) {
      var card = allCards[i];
      var okMedia = true;
      var okTags = true;
      //compares each card's media type to the selected types
      if (selectedMediaTypes.length > 0) {
        var media = (card.media_type || "").toLowerCase();
        okMedia = false;
        for (var m = 0; m < selectedMediaTypes.length; m++) {
          if (media === String(selectedMediaTypes[m]).toLowerCase()) {
            okMedia = true;
            break;
          }
        }
      }

      if (selectedTags.length > 0) {
        okTags = false;
        //splits the card's tags string with commas, trims each tag and converts to lowercase
        //written by cursor
        if (card.tags) {
          var cardTagsRaw = String(card.tags).toLowerCase().split(",");
          var cardTags = [];
          for (var t = 0; t < cardTagsRaw.length; t++) {
            cardTags.push(cardTagsRaw[t].trim());
          }
          // check if any selected tag appears in any card tag (substring match)
          for (var s = 0; s < selectedTags.length; s++) {
            var st = String(selectedTags[s]).toLowerCase();
            for (var ct = 0; ct < cardTags.length; ct++) {
              if (cardTags[ct].indexOf(st) !== -1) {
                okTags = true;
                break;
              }
            }
            if (okTags) break;
          }
        }
      }

      if (okMedia && okTags) {
        filtered.push(card);
      }
    }
  }

  displayCards(filtered);
}
//clear all filters
function clearAllFilters() {
  var allInputs = document.querySelectorAll("#mediaTypeDropdown input, #tagDropdown input");
  for (var i = 0; i < allInputs.length; i++) {
    allInputs[i].checked = false;
    var label = allInputs[i].nextElementSibling;
    if (label) {
      var icon = label.querySelector(".ri-check-line");
      if (icon) icon.classList.add("hidden");
    }
  }
  displayCards(allCards);
}

//open the exercise modal
function openExerciseModal(id, cardData) {
  displayDynamicModal(cardData);
}

function closeExerciseModal() {
  var modal = document.getElementById("exerciseModal");
  if (modal) modal.classList.remove("active");
}

//display exercise modal with information retrieved from backend
//written by cursor
function displayDynamicModal(cardData) {
  var titleEl = document.getElementById("modalTitle");
  if (titleEl) titleEl.textContent = cardData.file_name;

  var modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  var dynamicContent = document.getElementById("dynamicContent");
  if (!dynamicContent) {
    dynamicContent = document.createElement("div");
    dynamicContent.id = "dynamicContent";
    modalContent.appendChild(dynamicContent);
  }

  var colorClass = (cardData.focus_area === "mental") ? "blue" : "green";

  var stepsHtml = "";
  if (cardData.steps) {
    stepsHtml =
      '<div class="mt-4">' +
        '<h4 class="font-semibold text-' + colorClass + '-900 mb-2">Steps:</h4>' +
        '<p class="text-gray-700">' + String(cardData.steps).replace(/\n/g, "<br>") + "</p>" +
      "</div>";
  }

  var benefitsHtml = "";
  if (cardData.benefits) {
    benefitsHtml =
      '<div class="bg-gray-50 rounded-lg p-4">' +
        '<h5 class="font-semibold text-gray-900 mb-2">Benefits</h5>' +
        '<div class="text-gray-700 text-sm">' + String(cardData.benefits).replace(/\n/g, "<br>") + "</div>" +
      "</div>";
  }

  var buttonHtml = "";
  if (cardData.video_url) {
    buttonHtml =
      '<button onclick="window.open(\'' + cardData.video_url + '\', \'_blank\')" ' +
              'class="bg-' + colorClass + '-500 text-white px-6 py-3 rounded-lg">' +
        '<i class="ri-play-fill mr-2"></i>Start Exercise' +
      "</button>";
  } else {
    buttonHtml =
      '<button class="bg-' + colorClass + '-500 text-white px-6 py-3 rounded-lg" disabled>' +
        '<i class="ri-play-fill mr-2"></i>Exercise Available' +
      "</button>";
  }

  dynamicContent.innerHTML =
    '<div class="space-y-6">' +
      '<div class="bg-' + colorClass + '-50 rounded-lg p-6">' +
        '<p class="text-gray-700">' + (cardData.description || "Follow the exercise instructions.") + "</p>" +
        stepsHtml +
      "</div>" +
      (benefitsHtml ? benefitsHtml : "") +
      '<div class="flex justify-center">' + buttonHtml + "</div>" +
    "</div>";

  var modal = document.getElementById("exerciseModal");
  if (modal) modal.classList.add("active");
}

//get the color class for the card
function getColorClass(focusArea) {
  return (focusArea === "mental") ? "from-blue-50 to-blue-100" : "from-green-50 to-green-100";
}
function getBorderClass(focusArea) {
  return (focusArea === "mental") ? "border-blue-200" : "border-green-200";
}
function getIconClass(focusArea) {
  return (focusArea === "mental") ? "ri-lungs-line" : "ri-body-scan-line";
}
function getIconBgClass(focusArea) {
  return (focusArea === "mental") ? "bg-blue-500" : "bg-green-500";
}
function getTextClass(focusArea) {
  return (focusArea === "mental") ? "text-blue-900" : "text-green-900";
}
function getDescriptionClass(focusArea) {
  return (focusArea === "mental") ? "text-blue-700" : "text-green-700";
}
function getMetaTextClass(focusArea) {
  return (focusArea === "mental") ? "text-blue-600" : "text-green-600";
}

function formatDuration(seconds) {
  if (!seconds) return "5 Minutes";
  var minutes = Math.floor(seconds / 60);
  return String(minutes) + " Minute" + (minutes !== 1 ? "s" : "");
}
//create the card element when new card is added
//written by cursor
function createCardElement(card) {
  var div = document.createElement("div");
  var colorClass = getColorClass(card.focus_area);

  div.className = "exercise-card bg-gradient-to-br " + colorClass +
                  " rounded-xl p-8 cursor-pointer border " + getBorderClass(card.focus_area) +
                  " relative overflow-hidden group";

  div.onclick = function () { openExerciseModal(card.id, card); };

  var html =
    '<div class="flex items-start gap-6 relative z-10">' +
      '<div class="w-16 h-16 ' + getIconBgClass(card.focus_area) +
           ' rounded-xl flex items-center justify-center text-white flex-shrink-0">' +
        '<i class="' + getIconClass(card.focus_area) + ' text-2xl"></i>' +
      "</div>" +
      '<div class="flex-1">' +
        '<h3 class="text-xl font-semibold ' + getTextClass(card.focus_area) + ' mb-2">' +
          card.file_name + "</h3>" +
        '<p class="' + getDescriptionClass(card.focus_area) + ' mb-4">' +
          (card.description || "Self-care exercise") + "</p>" +
        '<div class="flex items-center gap-4 text-sm ' + getMetaTextClass(card.focus_area) + '">' +
          '<span class="flex items-center gap-1"><i class="ri-time-line"></i>' +
            formatDuration(card.duration_seconds) + "</span>" +
          '<span class="flex items-center gap-1"><i class="ri-heart-pulse-line"></i>' +
            card.focus_area + " Wellness</span>" +
        "</div>" +
      "</div>" +
    "</div>";

  div.innerHTML = html;
  return div;
}
//display the cards
//written by cursor
function displayCards(cards) {
  var container = document.querySelector(".grid.grid-cols-2.gap-8");
  if (!container) return;
  container.innerHTML = "";
  if (!cards || cards.length === 0) {
    container.innerHTML =
      '<div class="col-span-2 text-center py-12">' +
        '<div class="text-gray-400 mb-4">' +
          '<i class="ri-search-line text-6xl"></i>' +
        "</div>" +
        '<h3 class="text-xl font-semibold text-gray-600 mb-2">No exercises found</h3>' +
        '<p class="text-gray-500">Try adjusting your filters or browse all available exercises.</p>' +
        '<button onclick="clearAllFilters()" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">' +
          "Clear Filters" +
        "</button>" +
      "</div>";
    return;
  }

  for (var i = 0; i < cards.length; i++) {
    var el = createCardElement(cards[i]);
    container.appendChild(el);
  }
}

//load the self care cards
function loadSelfcareCards() {
  fetch(window.API_BASE + "/selfcare/files")
    .then(function (res) { return res.json(); })
    .then(function (cards) {
      if (cards && cards.length > 0) {
        allCards = cards;
        displayCards(cards);
      } else {
        allCards = [];
        displayCards([]);
      }
    })
    .catch(function (error) {
      console.error('Error loading self-care cards:', error);
      allCards = [];
      displayCards([]);
    });
}

//put the functions together
document.addEventListener("DOMContentLoaded", function () {
  // toggle check icon when checkbox is checked
  var inputs = document.querySelectorAll("#mediaTypeDropdown input, #tagDropdown input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("change", function () {
      var label = this.nextElementSibling;
      if (label) {
        var icon = label.querySelector(".ri-check-line");
        if (icon) icon.classList.toggle("hidden", !this.checked);
      }
      applyFilters();
    });
  }

  // close dropdowns when clicking outside
  //written by cursor to improve the usability
  document.addEventListener("click", function (e) {
    // if click is not on a toggle button or a dropdown panel, hide
    var onButton = false;
    var el = e.target;
    while (el) {
      if (el.tagName === "BUTTON" && el.getAttribute("onclick") && el.getAttribute("onclick").indexOf("toggleFilterDropdown") === 0) {
        onButton = true; break;
      }
      el = el.parentElement;
    }
    var insideDropdown = false;
    el = e.target;
    while (el) {
      if (el.id && el.id.slice(-8) === "Dropdown") { insideDropdown = true; break; }
      el = el.parentElement;
    }
    if (!onButton && !insideDropdown) {
      hideActiveDropdown();
    }
  });


  //load the self care cards
  loadSelfcareCards();
});
