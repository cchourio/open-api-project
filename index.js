// ===== Open-Meteo API – Weather Explorer =====
// Endpoint 1 (Temperature): fetches only temperature_2m & apparent_temperature
// Endpoint 2 (Conditions):  fetches only weathercode, windspeed_10m & relative_humidity_2m

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// WMO weather interpretation codes → human-readable descriptions
const WMO_CODES = {
  0: "Clear sky",
  1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
};

// ===== DOM references =====
const btnTemperature = document.getElementById("btn-temperature");
const btnConditions  = document.getElementById("btn-conditions");
const citySelect     = document.getElementById("city-select");
const contentArea    = document.getElementById("content-area");

// Track which view is active
let activeView = "temperature";

// ===== Helpers =====

function getCoords() {
  const [lat, lon] = citySelect.value.split(",");
  return { lat, lon };
}

function getCityName() {
  return citySelect.options[citySelect.selectedIndex].text;
}

function showLoading() {
  contentArea.innerHTML = '<p class="loading">Loading weather data…</p>';
}

function showError(message) {
  contentArea.innerHTML = `<p class="error-msg">⚠️ ${message}</p>`;
}

// ===== Endpoint 1 – Temperature =====
// Only requests: temperature_2m, apparent_temperature
async function fetchTemperature() {
  showLoading();
  const { lat, lon } = getCoords();
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature&temperature_unit=celsius`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    renderTemperature(data.current);
  } catch (err) {
    showError(`Could not load temperature data. ${err.message}`);
  }
}

function renderTemperature(current) {
  const city = getCityName();
  contentArea.innerHTML = `
    <div class="weather-card">
      <p class="card-title">🌡 Temperature — ${city}</p>

      <div class="stat-row">
        <span class="stat-label">Current Temperature</span>
        <span>
          <span class="stat-value large">${current.temperature_2m}</span>
          <span class="stat-unit">°C</span>
        </span>
      </div>

      <div class="stat-row">
        <span class="stat-label">Feels Like</span>
        <span>
          <span class="stat-value">${current.apparent_temperature}</span>
          <span class="stat-unit">°C</span>
        </span>
      </div>

      <div class="stat-row">
        <span class="stat-label">Last Updated</span>
        <span class="stat-label">${current.time.replace("T", " ")}</span>
      </div>
    </div>
  `;
}

// ===== Endpoint 2 – Conditions =====
// Only requests: weathercode, windspeed_10m, relative_humidity_2m
async function fetchConditions() {
  showLoading();
  const { lat, lon } = getCoords();
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=weathercode,windspeed_10m,relative_humidity_2m`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    renderConditions(data.current);
  } catch (err) {
    showError(`Could not load conditions data. ${err.message}`);
  }
}

function renderConditions(current) {
  const city = getCityName();
  const description = WMO_CODES[current.weathercode] ?? `Code ${current.weathercode}`;
  contentArea.innerHTML = `
    <div class="weather-card">
      <p class="card-title">🌬 Weather Conditions — ${city}</p>

      <div class="stat-row">
        <span class="stat-label">Sky Conditions</span>
        <span class="stat-value">${description}</span>
      </div>

      <div class="stat-row">
        <span class="stat-label">Wind Speed</span>
        <span>
          <span class="stat-value">${current.windspeed_10m}</span>
          <span class="stat-unit">km/h</span>
        </span>
      </div>

      <div class="stat-row">
        <span class="stat-label">Relative Humidity</span>
        <span>
          <span class="stat-value">${current.relative_humidity_2m}</span>
          <span class="stat-unit">%</span>
        </span>
      </div>

      <div class="stat-row">
        <span class="stat-label">Last Updated</span>
        <span class="stat-label">${current.time.replace("T", " ")}</span>
      </div>
    </div>
  `;
}

// ===== Event Listeners =====

btnTemperature.addEventListener("click", () => {
  activeView = "temperature";
  btnTemperature.classList.add("active");
  btnConditions.classList.remove("active");
  fetchTemperature();   // new GET request on every click
});

btnConditions.addEventListener("click", () => {
  activeView = "conditions";
  btnConditions.classList.add("active");
  btnTemperature.classList.remove("active");
  fetchConditions();    // new GET request on every click
});

// Changing the city re-fetches data for the current view
citySelect.addEventListener("change", () => {
  if (activeView === "temperature") {
    fetchTemperature();
  } else {
    fetchConditions();
  }
});

// ===== Initial load =====
fetchTemperature();