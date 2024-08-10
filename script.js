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

  themeToggle.addEventListener("change", toggleTheme);
  unitSelect.addEventListener("change", updateUnit);
});

async function getWeather() {
  const location = document.getElementById("location").value;
  const unit = document.getElementById("unitSelect").value;
  const apiKey = "33b108f5a8a84cbd8da162728240708";
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Location not found");
    }
    const data = await response.json();
    const weatherDiv = document.getElementById("weather");
    const temp =
      unit === "C" ? `${data.current.temp_c}°C` : `${data.current.temp_f}°F`;
    const feelsLike =
      unit === "C"
        ? `${data.current.feelslike_c}°C`
        : `${data.current.feelslike_f}°F`;

    weatherDiv.innerHTML = `
          <h2>Weather in ${data.location.name}</h2>
          <p>Temperature: ${temp}</p>
          <p>Feels Like: ${feelsLike}</p>
          <p>Condition: ${data.current.condition.text}</p>
          <p>Wind: ${data.current.wind_kph} kph</p>
          <p>Humidity: ${data.current.humidity}%</p>
          <p>Visibility: ${data.current.vis_km} km</p>
          <p>Pressure: ${data.current.pressure_mb} mb</p>
      `;
    weatherDiv.classList.add("visible");
  } catch (error) {
    document.getElementById("weather").innerHTML = `<p>${error.message}</p>`;
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
