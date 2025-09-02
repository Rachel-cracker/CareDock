// API setup
const API_BASE = "http://127.0.0.1:8000";
window.API_BASE = API_BASE;

// filters
let activeDropdown = null;

function toggleFilterDropdown(type) {
  const dropdown = document.getElementById(`${type}Dropdown`);
  if (activeDropdown && activeDropdown !== dropdown) activeDropdown.classList.add('hidden');
  dropdown.classList.toggle('hidden');
  activeDropdown = dropdown.classList.contains('hidden') ? null : dropdown;
}

document.addEventListener('click', (e) => {
  const isDropdownButton = e.target.closest('button[onclick^="toggleFilterDropdown"]');
  const isDropdown = e.target.closest('[id$="Dropdown"]');
  if (!isDropdownButton && !isDropdown && activeDropdown) {
    activeDropdown.classList.add('hidden');
    activeDropdown = null;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#mediaTypeDropdown input, #tagDropdown input').forEach(cb => {
    cb.addEventListener('change', function () {
      const checkIcon = this.nextElementSibling.querySelector('.ri-check-line');
      if (checkIcon) checkIcon.classList.toggle('hidden', !this.checked);
      applyFilters();
    });
  });
  
  // Load selfcare cards from database
  loadSelfcareCards();
});

// Store all cards globally for filtering
let allCards = [];

function applyFilters() {
  const selectedMediaTypes = getSelectedFilters('#mediaTypeDropdown');
  const selectedTags = getSelectedFilters('#tagDropdown');
  
  let filteredCards = allCards;
  
  // Filter by media type
  if (selectedMediaTypes.length > 0) {
    filteredCards = filteredCards.filter(card => 
      selectedMediaTypes.includes(card.media_type.toLowerCase())
    );
  }
  
  // Filter by tags
  if (selectedTags.length > 0) {
    filteredCards = filteredCards.filter(card => {
      if (!card.tags) return false;
      const cardTags = card.tags.toLowerCase().split(',').map(tag => tag.trim());
      return selectedTags.some(selectedTag => 
        cardTags.some(cardTag => cardTag.includes(selectedTag.toLowerCase()))
      );
    });
  }
  
  displayCards(filteredCards);
}

// Get selected filter values from dropdown
function getSelectedFilters(dropdownSelector) {
  const dropdown = document.querySelector(dropdownSelector);
  const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (activeDropdown) { 
      activeDropdown.classList.add('hidden'); 
      activeDropdown = null; 
    }
  }
});

// exercise modal
function openExerciseModal(id, cardData) {
  displayDynamicModal(cardData);
}

// Display modal with dynamic content from database
function displayDynamicModal(cardData) {
  document.getElementById('modalTitle').textContent = cardData.file_name;
  
  // Create and show dynamic content
  const modalContent = document.getElementById('modalContent');
  let dynamicContent = document.getElementById('dynamicContent');
  
  if (!dynamicContent) {
    dynamicContent = document.createElement('div');
    dynamicContent.id = 'dynamicContent';
    modalContent.appendChild(dynamicContent);
  }
  
  const colorClass = cardData.focus_area === 'mental' ? 'blue' : 'green';
  
  dynamicContent.innerHTML = `
    <div class="space-y-6">
      <div class="bg-${colorClass}-50 rounded-lg p-6">
        <p class="text-gray-700">${cardData.description || 'Follow the exercise instructions.'}</p>
        ${cardData.steps ? `<div class="mt-4"><h4 class="font-semibold text-${colorClass}-900 mb-2">Steps:</h4><p class="text-gray-700">${cardData.steps.replace(/\n/g, '<br>')}</p></div>` : ''}
      </div>
      ${cardData.benefits ? `
      <div class="bg-gray-50 rounded-lg p-4">
        <h5 class="font-semibold text-gray-900 mb-2">Benefits</h5>
        <div class="text-gray-700 text-sm">${cardData.benefits.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}
      <div class="flex justify-center">
        ${cardData.video_url ? `
        <button onclick="window.open('${cardData.video_url}', '_blank')" class="bg-${colorClass}-500 text-white px-6 py-3 rounded-lg">
          <i class="ri-play-fill mr-2"></i>Start Exercise
        </button>
        ` : `
        <button class="bg-${colorClass}-500 text-white px-6 py-3 rounded-lg" disabled>
          <i class="ri-play-fill mr-2"></i>Exercise Available
        </button>
        `}
      </div>
    </div>
  `;
  
  document.getElementById('exerciseModal').classList.add('active');
}

function closeExerciseModal() {
  document.getElementById('exerciseModal').classList.remove('active');
}

// Load selfcare cards from database
async function loadSelfcareCards() {
  try {
    const response = await fetch(`${API_BASE}/selfcare/files`);
    const cards = await response.json();
    
    if (cards && cards.length > 0) {
      allCards = cards; // Store all cards globally for filtering
      displayCards(cards);
    }
  } catch (error) {
    console.error('Error loading selfcare cards:', error);
  }
}

// Display cards dynamically
function displayCards(cards) {
  const cardsContainer = document.querySelector('.grid.grid-cols-2.gap-8');
  if (!cardsContainer) return;
  
  // Clear existing cards
  cardsContainer.innerHTML = '';
  
  if (cards.length === 0) {
    // Show no results message
    cardsContainer.innerHTML = `
      <div class="col-span-2 text-center py-12">
        <div class="text-gray-400 mb-4">
          <i class="ri-search-line text-6xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No exercises found</h3>
        <p class="text-gray-500">Try adjusting your filters or browse all available exercises.</p>
        <button onclick="clearAllFilters()" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Clear Filters
        </button>
      </div>
    `;
    return;
  }
  
  cards.forEach(card => {
    const cardElement = createCardElement(card);
    cardsContainer.appendChild(cardElement);
  });
}

// Create individual card element
//written by cursor
function createCardElement(card) {
  const div = document.createElement('div');
  const colorClass = getColorClass(card.focus_area);
  const iconClass = getIconClass(card.focus_area);
  
  div.className = `exercise-card bg-gradient-to-br ${colorClass} rounded-xl p-8 cursor-pointer border ${getBorderClass(card.focus_area)} relative overflow-hidden group`;
  div.onclick = () => openExerciseModal(card.id, card);
  
  div.innerHTML = `
    <div class="flex items-start gap-6 relative z-10">
      <div class="w-16 h-16 ${getIconBgClass(card.focus_area)} rounded-xl flex items-center justify-center text-white flex-shrink-0">
        <i class="${iconClass} text-2xl"></i>
      </div>
      <div class="flex-1">
        <h3 class="text-xl font-semibold ${getTextClass(card.focus_area)} mb-2">${card.file_name}</h3>
        <p class="${getDescriptionClass(card.focus_area)} mb-4">${card.description || 'Self-care exercise'}</p>
        <div class="flex items-center gap-4 text-sm ${getMetaTextClass(card.focus_area)}">
          <span class="flex items-center gap-1"><i class="ri-time-line"></i>${formatDuration(card.duration_seconds)}</span>
          <span class="flex items-center gap-1"><i class="ri-heart-pulse-line"></i>${card.focus_area} Wellness</span>
        </div>
      </div>
    </div>
  `;
  
  return div;
}

// Helper functions for styling based on focus area
//if the focus area is mental, return the blue color
//if the focus area is physical, return the green color
function getColorClass(focusArea) {
  return focusArea === 'mental' ? 'from-blue-50 to-blue-100' : 'from-green-50 to-green-100';
}
function getBorderClass(focusArea) {
  return focusArea === 'mental' ? 'border-blue-200' : 'border-green-200';
}
function getIconClass(focusArea) {
  return focusArea === 'mental' ? 'ri-lungs-line' : 'ri-body-scan-line';
}
function getIconBgClass(focusArea) {
  return focusArea === 'mental' ? 'bg-blue-500' : 'bg-green-500';
}
function getTextClass(focusArea) {
  return focusArea === 'mental' ? 'text-blue-900' : 'text-green-900';
}
function getDescriptionClass(focusArea) {
  return focusArea === 'mental' ? 'text-blue-700' : 'text-green-700';
}
function getMetaTextClass(focusArea) {
  return focusArea === 'mental' ? 'text-blue-600' : 'text-green-600';
}

function formatDuration(seconds) {
  if (!seconds) return '5 Minutes';
  const minutes = Math.floor(seconds / 60);
  return `${minutes} Minute${minutes !== 1 ? 's' : ''}`;
}

// Clear all filters and show all cards
function clearAllFilters() {
  // Uncheck all checkboxes
  document.querySelectorAll('#mediaTypeDropdown input, #tagDropdown input').forEach(checkbox => {
    checkbox.checked = false;
    const checkIcon = checkbox.nextElementSibling.querySelector('.ri-check-line');
    if (checkIcon) checkIcon.classList.add('hidden');
  });
  
  // Display all cards
  displayCards(allCards);
}