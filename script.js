//get input and button elements
let cityInput = document.getElementById("cityInput");
let getWeatherBtn = document.getElementById("getWeatherBtn");
const getLocationBtn = document.getElementById("getLocationBtn");
let weatherResult = document.getElementById("weatherResult");
let currentUnit = "C"; //Default unit is Celsius
let lastSearchedCity = "";
//let currentUnit = "C";  // default is Celsius
let tempC = null;       // global temp in Celsius
let tempF = null;       // global temp in Fahrenheit

//api key
const apiKey = "b52549667a1b8a620c6a73287b767c7e";


//for dropdown and suggestions
const suggestionsList = document.getElementById("suggestions");

cityInput.addEventListener("input", function() {
    const query = cityInput.value.trim();

    if(query.length < 2){
        suggestionsList.innerHTML = "";
        return;
    }


    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    fetch(geoUrl)
    .then(res => res.json())
    .then(data => {
        showSuggestions(data);
    })
    .catch(err => {
        console.error("Geo API Error:", err);
        suggestionsList.innerHTML = "";
    });

});

function showSuggestions(cities) {
    suggestionsList.innerHTML = "";

    cities.forEach(city => {
        const item = document.createElement("li");
        item.className = "suggestion-item";
        item.textContent = `${city.name}, ${city.state || ""}, ${city.country}`;
        item.addEventListener("click", () => {
            cityInput.value = city.name;
            suggestionsList.innerHTML = "";
            getWeatherData(city.name);
        });

        suggestionsList.appendChild(item);
    });
}


//adding conversion celcuis to fahrenheit
const unitToggle = document.getElementById("unitToggle");

unitToggle.addEventListener("click", ()=> {
    if (currentUnit === "C"){
        currentUnit = "F";
        unitToggle.textContent = "Switch to °C";
    }else{
        currentUnit = "C";
        unitToggle.textContent = "Switch to °F";
    }

    //Re-fetch weather for the current city input
    const city = cityInput.value.trim() || lastSearchedCity;
    if(city){
        getWeatherData(city);
    }
});


//Event listener when button is clicked
getWeatherBtn.addEventListener("click", () => {
    let city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = "<p> Please enter a city name.</p>";
        return;
    }
    //call the function to fetch weather
    getWeatherData(city);
});

//here we are the functionality of get my location weather
getLocationBtn.addEventListener("click", () =>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(async (position)=> {
            const {latitude, longitude} = position.coords;

            try{
                //Reverse geocoding using OpenWeatherAPI
                const geoResponse = await fetch(
                    
                    `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`   
                );
                const geoData = await geoResponse.json();

                if(geoData.length > 0){
                    const city = geoData[0].name;
                    cityInput.value = city; //show in input field
                    getWeatherData(city);
                }else{
                    weatherResult.innerHTML = "Could not determine your city.";
                }
            }catch(error){
                weatherResult.innerHTML = "Error fetching location data.";
                console.error(error);
            }
        }, () => {
            weatherResult.innerHTML = "Geolocation permission denied.";
        });
    }else{
        weatherResult.innerHTML = "Geolocation is not supported by this browser.";
    }
});

//step 2 define the getWeatherData() function

function getWeatherData(city) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    //show loading message
    weatherResult.innerHTML = "<p>Loading...</p>";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            lastSearchedCity = data.name; // store the last searched city here
            showWeather(data);

            /*google map link*/
            //assume `cityname` holds the final city entered
            const city = data.name;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`;

            const mapLinkElement = document.getElementById("mapLink");
            mapLinkElement.innerHTML = `<a href="${mapUrl}" target="_blank" >📍 View ${city} on Google Maps </a>`;


        })
        .catch(error => {
            weatherResult.innerHTML = `<p>${error.message}</p>`;
        });


}


function showWeather(data) {
    const weatherResult = document.getElementById("weatherResult");

    const temperature = data.main.temp;
    const city = data.name;
    const condition = data.weather[0].main;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const icon = data.weather[0].icon;

    weatherResult.style.display = "block"; // make it visible if hidden
    weatherResult.innerHTML = `
        <h3>${city}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${condition}">
        <p><strong>Temperature:</strong> ${temperature.toFixed(1)} °C</p>
        <p><strong>Condition:</strong> ${condition}</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        <div id="mapLink" style="margin-top: 10px;"></div>
    `;
}



const darkModeToggle = document.getElementById("darkModeToggle");

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

function updateDateTime() {
    const now = new Date();


    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const formatted = now.toLocaleString('en-IN', options);
    document.getElementById('dateTime').textContent = formatted;
}

setInterval(updateDateTime, 1000); //update every second
updateDateTime(); //intial call

