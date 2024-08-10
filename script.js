document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const unitSelect = document.getElementById("unitSelect");
  const darkMode = localStorage.getItem("darkMode");
  const unit = localStorage.getItem("unit") || "C";

  if (darkMode === "enabled") {
    document.documentElement.classList.add("dark-mode");
    themeToggle.checked = true;
  }

  unitSelect.value = unit;

  loadHistory();

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
  const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=no&alerts=no`;

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

    addToHistory(location);
  } catch (error) {
    document.getElementById("weather").innerHTML = `<p>${error.message}</p>`;
    document.getElementById("forecastList").innerHTML = "";
  }
}

function toggleTheme() {
  const isDarkMode = document.documentElement.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

function updateUnit() {
  const unit = document.getElementById("unitSelect").value;
  localStorage.setItem("unit", unit);
  getWeather(); // Refresh the weather data with the new unit
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
