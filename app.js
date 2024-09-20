const apiKey = '2dab9e4ba1b6212f98e51723c6274d1d'; // Replace with your OpenWeatherMap API Key
let isCelsius = true;

document.getElementById('weather-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('city').value;
    getWeather(city);
});

document.getElementById('toggle-temp').addEventListener('click', () => {
    const city = document.getElementById('city').value;
    if (city) {
        isCelsius = !isCelsius;
        getWeather(city);
    }
});

document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
});

function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    document.getElementById('loading-spinner').classList.remove('hidden');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            getForecast(data.coord.lat, data.coord.lon);
            document.getElementById('loading-spinner').classList.add('hidden');
        })
        .catch(error => {
            displayError(error.message);
            document.getElementById('loading-spinner').classList.add('hidden');
        });
}

function displayWeather(data) {
    const weatherInfoDiv = document.getElementById('weather-info');
    const temp = isCelsius ? data.main.temp : (data.main.temp * 9/5 + 32).toFixed(1);
    const unit = isCelsius ? '°C' : '°F';
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    weatherInfoDiv.innerHTML = `
        <h2>Weather in ${data.name}</h2>
        <img src="${icon}" alt="Weather Icon">
        <p>Temperature: ${temp}${unit}</p>
        <p>Condition: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p>Pressure: ${data.main.pressure} hPa</p>
        <p>Visibility: ${(data.visibility / 1000).toFixed(1)} km</p>
        <p>Sunrise: ${sunrise}</p>
        <p>Sunset: ${sunset}</p>
    `;
    document.getElementById('weather-info').classList.add('visible');
    document.getElementById('toggle-temp').classList.remove('hidden');
    document.getElementById('error-message').classList.add('hidden');
    document.getElementById('toggle-temp').textContent = isCelsius ? "Show in Fahrenheit" : "Show in Celsius";
}

function displayError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
}

function getForecast(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => console.error(error));
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast-info');
    forecastDiv.innerHTML = '';

    // Get daily forecasts (every 8th forecast in 3-hour intervals -> one per day)
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const temp = isCelsius ? forecast.main.temp : (forecast.main.temp * 9/5 + 32).toFixed(1);
        const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

        const forecastDay = `
            <div class="forecast-day">
                <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
                <img src="${icon}" alt="Forecast Icon">
                <p>${temp}°${isCelsius ? 'C' : 'F'}</p>
                <p>${forecast.weather[0].description}</p>
            </div>
        `;

        forecastDiv.innerHTML += forecastDay;
    }
    forecastDiv.classList.remove('hidden');
}

// Auto-detect location using Geolocation API
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
    });
}

function getWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => displayError(error.message));
}
