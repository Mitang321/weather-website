async function getWeather() {
  const location = document.getElementById("location").value;
  const apiKey = "33b108f5a8a84cbd8da162728240708";
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Location not found");
    }
    const data = await response.json();
    const weatherDiv = document.getElementById("weather");
    weatherDiv.innerHTML = `
            <h2>Weather in ${data.location.name}</h2>
            <p>Temperature: ${data.current.temp_c}°C</p>
                    <p>Condition: ${data.current.condition.text}</p>
        <p>Wind: ${data.current.wind_kph} kph</p>
        <p>Humidity: ${data.current.humidity}%</p>
    `;
    weatherDiv.classList.add("visible");
  } catch (error) {
    document.getElementById("weather").innerHTML = `<p>${error.message}</p>`;
  }
}
