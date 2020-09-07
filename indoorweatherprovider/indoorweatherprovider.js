WeatherProvider.register("indoorweatherprovider", {
  providerName: "IndoorWeatherProvider",
  init(){
    Log.info("IndoorWeatherProvider initializing");
  }
  fetchCurrentWeather() {
    Log.info("IndoorWeatherProvider fetching data");
    this.fetchData(this.config.url)
    .then((data) => {
      if (!data || !data.length) {
        // Did not receive usable new data.
        // Maybe this needs a better check?
        return;
      }
      Log.info("IndoorWeatherProvider processing data");
      const forecast = this.generateWeatherObjectsFromData(data);
      this.setWeatherForecast(forecast);
    })
    .catch(function (request) {
      Log.error("Could not load data ... ", request);
    })
    .finally(() => this.updateAvailable());
  },

  fetchWeatherForecast() {
    // This method isnt Implemented
    return;
  },

  generateWeatherObjectFromData(indoorWeatherData) {
    const currentWeather = new WeatherObject(this.config.units, this.config.tempUnits, this.config.windUnits);
    var dataObject = JSON.Parse(indoorWeatherData);
    if(this.config.units == "imperial"){
      currentWeather.temperature = ((data.temperature * (9.0/5.0))+32);
    } else {
      // metric is the only other option
      currentWeather.temperature = data.temperature;
    }

    currentWeather.humidity = data.humidity;
    // currentWeather.windSpeed = currentWeatherData.windSpeed.split(" ", 1);
    // currentWeather.windDirection = this.convertWindDirection(currentWeatherData.windDirection);
    // currentWeather.weatherType = this.convertWeatherType(currentWeatherData.shortForecast, currentWeatherData.isDaytime);

    // determine the sunrise/sunset times - not supplied in weather.gov data
    // let times = this.calcAstroData(this.config.lat, this.config.lon);
    // currentWeather.sunrise = times[0];
    // currentWeather.sunset = times[1];
    return currentWeather;
  },
});
