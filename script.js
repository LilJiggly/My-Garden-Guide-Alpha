// Global variables
let plants = [];
let soilData = {};
let moistureData = {};
let activeFilters = {
  light: null,
  soil: null,
  moisture: null,
};

// Load data from JSON file
async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    plants = data.plants;
    soilData = data.soilData;
    moistureData = data.moistureData;

    // Initialize the app after data is loaded
    setupFilterListeners();
    displayPlants(plants);
  } catch (error) {
    console.error("Error loading data:", error);
    // Fallback: show error message
    document.getElementById("plantGrid").innerHTML =
      '<div style="text-align: center; color: #666;">Fout bij het laden van plantgegevens.</div>';
  }
}

// Function to create placeholder image
function createPlaceholder(plantName) {
  const placeholder = document.createElement("div");
  placeholder.className = "plant-image-placeholder";
  placeholder.innerHTML = `<span>🌱<br>${plantName}</span>`;
  placeholder.style.cssText = `
    width: 100%;
    height: 150px;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    text-align: center;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 14px;
    line-height: 1.2;
  `;
  return placeholder;
}

// Setup filter event listeners
function setupFilterListeners() {
  document.querySelectorAll(".filter-option").forEach((option) => {
    option.addEventListener("click", function () {
      const filterType = this.dataset.filter;
      const filterValue = this.dataset.value;

      // Toggle filter
      if (activeFilters[filterType] === filterValue) {
        activeFilters[filterType] = null;
        this.classList.remove("active");
      } else {
        // Remove active from other options in same category
        document
          .querySelectorAll(`[data-filter="${filterType}"]`)
          .forEach((opt) => {
            opt.classList.remove("active");
          });

        activeFilters[filterType] = filterValue;
        this.classList.add("active");
      }

      filterPlants();
    });
  });
}

// Filter plants based on active filters
function filterPlants() {
  const filteredPlants = plants.filter((plant) => {
    return (
      matchesFilter(plant, "light", activeFilters.light) &&
      matchesFilter(plant, "soil", activeFilters.soil) &&
      matchesFilter(plant, "moisture", activeFilters.moisture)
    );
  });

  displayPlants(filteredPlants);
  updateResultsCount(filteredPlants.length);
}

// Check if plant matches filter
function matchesFilter(plant, type, filterValue) {
  if (!filterValue) return true;

  const plantValue = plant[type].toLowerCase();
  const filter = filterValue.toLowerCase();

  // Handle compound conditions (e.g., "Zon – halfschaduw", "Arm – matig")
  return plantValue.includes(filter);
}

// Display plants in the grid
function displayPlants(plantsToShow) {
  const grid = document.getElementById("plantGrid");
  const noResults = document.getElementById("noResults");

  if (plantsToShow.length === 0) {
    grid.style.display = "none";
    noResults.style.display = "block";
    return;
  }

  grid.style.display = "grid";
  noResults.style.display = "none";

  // Clear grid and add plants with placeholders
  grid.innerHTML = "";

  plantsToShow.forEach((plant) => {
    const plantCard = document.createElement("div");
    plantCard.className = "plant-card";

    // Create placeholder
    const placeholder = createPlaceholder(plant.dutch);
    plantCard.appendChild(placeholder);

    // Add plant info
    plantCard.innerHTML += `
      <div class="plant-name">${plant.dutch}</div>
      <div class="plant-latin">${plant.latin}</div>
      <div class="plant-conditions">
        <div class="condition">
          <div class="condition-icon light-icon">☀</div>
          <span>${plant.light}</span>
        </div>
        <div class="condition">
          <div class="condition-icon soil-icon">🌱</div>
          <span>${plant.soil}</span>
        </div>
        <div class="condition">
          <div class="condition-icon moisture-icon">💧</div>
          <span>${plant.moisture}</span>
        </div>
      </div>
    `;

    grid.appendChild(plantCard);
  });
}

// Update results count display
function updateResultsCount(count) {
  const resultsCount = document.getElementById("resultsCount");
  if (count === plants.length) {
    resultsCount.textContent = "Alle planten worden getoond";
  } else {
    resultsCount.textContent = `${count} van ${plants.length} planten gevonden`;
  }
}

// Clear all active filters
function clearAllFilters() {
  activeFilters = { light: null, soil: null, moisture: null };
  document.querySelectorAll(".filter-option").forEach((option) => {
    option.classList.remove("active");
  });
  displayPlants(plants);
  updateResultsCount(plants.length);
}

// Soil help popup functions
function showSoilHelp() {
  document.getElementById("soilPopup").style.display = "block";
}

function closeSoilHelp() {
  document.getElementById("soilPopup").style.display = "none";
  document.getElementById("soilResult").style.display = "none";
}

function checkSoilFertility() {
  const postalCode = document.getElementById("postalCode").value.trim();
  const resultDiv = document.getElementById("soilResult");

  if (!postalCode) {
    alert("Voer een postcode in");
    return;
  }

  // Extract first digit of postal code
  const firstDigit = postalCode.charAt(0);
  const soilInfo = soilData[firstDigit];

  if (soilInfo) {
    resultDiv.innerHTML = `
            <strong>Bodemtype voor postcode ${postalCode}:</strong><br>
            <strong>Type:</strong> ${soilInfo.type}<br>
            <strong>Vruchtbaarheid:</strong> ${soilInfo.fertility}<br>
            <strong>Beschrijving:</strong> ${soilInfo.description}<br><br>
            <em>Klik op "${
              soilInfo.fertility === "Arm"
                ? "Arme grond"
                : soilInfo.fertility === "Matig"
                ? "Matige voedselrijkdom"
                : "Rijke grond"
            }" in de filter om planten te vinden die geschikt zijn voor jouw bodem.</em>
        `;
    resultDiv.style.display = "block";
  } else {
    resultDiv.innerHTML = `
            <strong>Geen specifieke data gevonden voor postcode ${postalCode}</strong><br>
            Gebruik de algemene richtlijnen hieronder om je bodemtype te bepalen.
        `;
    resultDiv.style.display = "block";
  }
}

// Moisture help popup functions
function showMoistureHelp() {
  document.getElementById("moisturePopup").style.display = "block";
}

function closeMoistureHelp() {
  document.getElementById("moisturePopup").style.display = "none";
  document.getElementById("moistureResult").style.display = "none";
}

function checkMoistureLevel() {
  const postalCode = document.getElementById("moisturePostalCode").value.trim();
  const resultDiv = document.getElementById("moistureResult");

  if (!postalCode) {
    alert("Voer een postcode in");
    return;
  }

  // Extract first digit of postal code
  const firstDigit = postalCode.charAt(0);
  const moistureInfo = moistureData[firstDigit];

  if (moistureInfo) {
    resultDiv.innerHTML = `
            <strong>Grondwaterstand voor postcode ${postalCode}:</strong><br>
            <strong>Regio:</strong> ${moistureInfo.region}<br>
            <strong>Grondwaterstand:</strong> ${moistureInfo.groundwater}<br>
            <strong>Vochtigheid:</strong> ${moistureInfo.moisture}<br>
            <strong>Beschrijving:</strong> ${moistureInfo.description}<br><br>
            <em>Klik op "${moistureInfo.moisture}" in de filter om planten te vinden die geschikt zijn voor jouw vochtigheidsgraad.</em>
        `;
    resultDiv.style.display = "block";
  } else {
    resultDiv.innerHTML = `
            <strong>Geen specifieke data gevonden voor postcode ${postalCode}</strong><br>
            Gebruik de algemene richtlijnen hieronder om je vochtigheidsgraad te bepalen.
        `;
    resultDiv.style.display = "block";
  }
}

// Keyboard event handlers
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeSoilHelp();
    closeMoistureHelp();
  }
});

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  loadData();
});
