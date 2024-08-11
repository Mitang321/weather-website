document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const unitSelect = document.getElementById("unitSelect");
  const authStatus = document.getElementById("authStatus");
  const darkMode = localStorage.getItem("darkMode");
  const unit = localStorage.getItem("unit") || "C";

  if (darkMode === "enabled") {
    document.documentElement.classList.add("dark-mode");
    themeToggle.checked = true;
  }

  unitSelect.value = unit;

  loadHistory();
  loadPreferences();
  loadAdvancedMetrics();
  updateAuthStatus();

  themeToggle.addEventListener("change", toggleTheme);
  unitSelect.addEventListener("change", updateUnit);
});

async function getWeather() {
  const location = document.getElementById("location").value;
  const unit = document.getElementById("unitSelect").value;
  if (!location || !location.trim()) {
    alert("Please enter a valid location.");
    return;
  }

  const apiKey = "33b108f5a8a84cbd8da162728240708";
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`;
  const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no&alerts=yes`;

  try {
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(url),
      fetch(forecastUrl),
    ]);
    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error("Location not found");
    }

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    const weatherDiv = document.getElementById("weather");
    const forecastListDiv = document.getElementById("forecastList");
    const hourlyListDiv = document.getElementById("hourlyList");
    const alertsListDiv = document.getElementById("alertsList");

    const temp =
      unit === "C"
        ? `${weatherData.current.temp_c}°C`
        : `${weatherData.current.temp_f}°F`;
    const feelsLike =
      unit === "C"
        ? `${weatherData.current.feelslike_c}°C`
        : `${weatherData.current.feelslike_f}°F`;

    weatherDiv.innerHTML = `
          <h2>Weather in ${weatherData.location.name}</h2>
          <p>Temperature: ${temp}</p>
          <p>Feels Like: ${feelsLike}</p>
          <p>Condition: ${weatherData.current.condition.text}</p>
          <p>Wind: ${weatherData.current.wind_kph} kph</p>
          <p>Humidity: ${weatherData.current.humidity}%</p>
          <p>Visibility: ${weatherData.current.vis_km} km</p>
          <p>Pressure: ${weatherData.current.pressure_mb} mb</p>
      `;
    weatherDiv.classList.add("visible");

    forecastListDiv.innerHTML = forecastData.forecast.forecastday
      .map(
        (day) => `
          <div class="day">
              <div>${new Date(day.date).toLocaleDateString()}</div>
              <div>${day.day.condition.text}</div>
              <div>${
                unit === "C"
                  ? day.day.avgtemp_c + "°C"
                  : day.day.avgtemp_f + "°F"
              }</div>
          </div>
      `
      )
      .join("");
    forecastListDiv.classList.add("visible");

    hourlyListDiv.innerHTML = forecastData.forecast.forecastday
      .flatMap((day) =>
        day.hour.slice(-2).map(
          (hour) => `
              <div class="hour">
                  <div>${new Date(hour.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</div>
                  <div>${hour.condition.text}</div>
                  <div>${
                    unit === "C" ? hour.temp_c + "°C" : hour.temp_f + "°F"
                  }</div>
              </div>
          `
        )
      )
      .join("");
    hourlyListDiv.classList.add("visible");

    alertsListDiv.innerHTML = (forecastData.alerts?.alert || [])
      .map(
        (alert) => `
          <div class="alert">
              <div>${alert.event}</div>
              <div>${alert.headline}</div>
              <div>${alert.description}</div>
          </div>
      `
      )
      .join("");
    alertsListDiv.classList.add("visible");

    addToHistory(location);
    addToPreferences(location);
    loadAdvancedMetrics();
  } catch (error) {
    document.getElementById("weather").innerHTML = `<p>${error.message}</p>`;
    document.getElementById("forecastList").innerHTML = "";
    document.getElementById("hourlyList").innerHTML = "";
    document.getElementById("alertsList").innerHTML = "";
  }
}

function toggleTheme() {
  const isDarkMode = document.documentElement.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

function updateUnit() {
  const unit = document.getElementById("unitSelect").value;
  localStorage.setItem("unit", unit);
  getWeather();
}

function loadHistory() {
  const historyList = JSON.parse(localStorage.getItem("historyList")) || [];
  const historyListEl = document.getElementById("historyList");
  historyListEl.innerHTML = "";

  historyList.forEach((location, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
          ${location}
          <button onclick="deleteHistory(${index})">Delete</button>
      `;
    historyListEl.appendChild(li);
  });
}

function addToHistory(location) {
  let historyList = JSON.parse(localStorage.getItem("historyList")) || [];
  if (!historyList.includes(location)) {
    historyList.push(location);
    localStorage.setItem("historyList", JSON.stringify(historyList));
    loadHistory();
  }
}

function deleteHistory(index) {
  let historyList = JSON.parse(localStorage.getItem("historyList")) || [];
  historyList.splice(index, 1);
  localStorage.setItem("historyList", JSON.stringify(historyList));
  loadHistory();
}

function loadPreferences() {
  const preferencesList =
    JSON.parse(localStorage.getItem("preferencesList")) || [];
  const preferencesListEl = document.getElementById("preferencesList");
  preferencesListEl.innerHTML = "";

  preferencesList.forEach((location, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
          ${location}
          <button onclick="deletePreference(${index})">Remove</button>
      `;
    preferencesListEl.appendChild(li);
  });
}

function addToPreferences(location) {
  let preferencesList =
    JSON.parse(localStorage.getItem("preferencesList")) || [];
  if (!preferencesList.includes(location)) {
    preferencesList.push(location);
    localStorage.setItem("preferencesList", JSON.stringify(preferencesList));
    loadPreferences();
  }
}

function deletePreference(index) {
  let preferencesList =
    JSON.parse(localStorage.getItem("preferencesList")) || [];
  preferencesList.splice(index, 1);
  localStorage.setItem("preferencesList", JSON.stringify(preferencesList));
  loadPreferences();
}

async function updateAuthStatus() {
  const username = localStorage.getItem("username");
  const authStatus = document.getElementById("authStatus");
  if (username) {
    authStatus.innerText = `Logged in as ${username}`;
  } else {
    authStatus.innerText = "Not logged in";
  }
}

async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
  updateAuthStatus();
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const storedUsername = localStorage.getItem("username");
  const storedPassword = localStorage.getItem("password");

  if (username === storedUsername && password === storedPassword) {
    localStorage.setItem("username", username);
    updateAuthStatus();
  } else {
    alert("Invalid username or password.");
  }
}

function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  updateAuthStatus();
}

function loadAdvancedMetrics() {
  const advancedMetrics = document.getElementById("advancedMetrics");
  const metrics = JSON.parse(localStorage.getItem("advancedMetrics")) || [];

  advancedMetrics.innerHTML = metrics
    .map(
      (metric) => `
      <div class="metric">
          <h4>${metric.title}</h4>
          <p>${metric.description}</p>
      </div>
  `
    )
    .join("");
}

function addAdvancedMetrics() {
  const metrics = [
    {
      title: "UV Index",
      description: "Shows the UV index for the current location.",
    },
    {
      title: "Air Quality",
      description:
        "Displays the air quality index (AQI) for the current location.",
    },
  ];

  localStorage.setItem("advancedMetrics", JSON.stringify(metrics));
  loadAdvancedMetrics();
}

addAdvancedMetrics();
