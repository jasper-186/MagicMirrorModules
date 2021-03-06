/* Magic Mirror
 * Module: CurrentIndoorWeather
 *
 * Originally By Michael Teeuw https://michaelteeuw.nl
 * Modified By Joe Echtenkamp, for use with Indoor weather server
 * MIT Licensed.
 */
 'use strict';

Module.register("currentindoorweather", {
	// Default module config.
	defaults: {
		location: false,
		locationID: false,
		appid: "",
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		showPeriod: true,
		showPeriodUpper: false,
		showWindDirection: false,
		showWindDirectionAsArrow: false,
		useBeaufort: true,
		useKMPHwind: false,
		lang: config.language,
		decimalSymbol: ".",
		showHumidity: true,
		showSun: false,
		degreeLabel: false,
		showIndoorTemperature: false,
		showIndoorHumidity: false,
		showFeelsLike: false,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,

		apiVersion: "2.5",
		apiBase: "http://192.168.0.30/",
		weatherEndpoint: "weather",

		appendLocationNameToHeader: true,
		calendarClass: "calendar",
		tableClass: "large",

		onlyTemp: false,
		hideTemp: false,
		roundTemp: false,

		iconTable: {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-cloudy-windy",
			"09d": "wi-showers",
			"10d": "wi-rain",
			"11d": "wi-thunderstorm",
			"13d": "wi-snow",
			"50d": "wi-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		}
	},

	// create a variable for the first upcoming calendar event. Used if no location is specified.
	firstEvent: false,

	// create a variable to hold the location name based on the API result.
	fetchedLocationName: "Indoors",

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function () {
		return ["weather-icons.css", "currentindoorweather.css"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);
		console.log("Starting module: " + this.name);
		// Set locale.
		moment.locale(config.language);

		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.sunriseSunsetTime = null;
		this.sunriseSunsetIcon = null;
		this.temperature = null;
		this.indoorTemperature = null;
		this.indoorHumidity = null;
		this.weatherType = null;
		this.feelsLike = null;
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	// add extra information of current weather
	// windDirection, humidity, sunrise and sunset
	addExtraInfoWeather: function (wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium";
/*
		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind dimmed";
		small.appendChild(windIcon);

		var windSpeed = document.createElement("span");
		windSpeed.innerHTML = " " + this.windSpeed;
		small.appendChild(windSpeed);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("sup");
			if (this.config.showWindDirectionAsArrow) {
				if (this.windDeg !== null) {
					windDirection.innerHTML = ' &nbsp;<i class="fa fa-long-arrow-down" style="transform:rotate(' + this.windDeg + 'deg);"></i>&nbsp;';
				}
			} else {
				windDirection.innerHTML = " " + this.translate(this.windDirection);
			}
			small.appendChild(windDirection);
		}
		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);
*/
		if (this.config.showHumidity) {
			var humidity = document.createElement("span");
			humidity.innerHTML = this.humidity;

			var supspacer = document.createElement("sup");
			supspacer.innerHTML = "&nbsp;";

			var humidityIcon = document.createElement("sup");
			humidityIcon.className = "wi wi-humidity humidityIcon";
			humidityIcon.innerHTML = "&nbsp;";

			small.appendChild(humidity);
			small.appendChild(supspacer);
			small.appendChild(humidityIcon);
		}

		if (this.config.showSun) {
			var sunriseSunsetIcon = document.createElement("span");
			sunriseSunsetIcon.className = "wi dimmed " + this.sunriseSunsetIcon;
			small.appendChild(sunriseSunsetIcon);

			var sunriseSunsetTime = document.createElement("span");
			sunriseSunsetTime.innerHTML = " " + this.sunriseSunsetTime;
			small.appendChild(sunriseSunsetTime);
		}

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.tableClass;

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.onlyTemp === false) {
			this.addExtraInfoWeather(wrapper);
		}

		var large = document.createElement("div");
		large.className = "light";

		var degreeLabel = "";
		if (this.config.units === "metric" || this.config.units === "imperial") {
			degreeLabel += "°";
		}
		if (this.config.degreeLabel) {
			switch (this.config.units) {
				case "metric":
					degreeLabel += "C";
					break;
				case "imperial":
					degreeLabel += "F";
					break;
				case "default":
					degreeLabel += "K";
					break;
			}
		}

		if (this.config.decimalSymbol === "") {
			this.config.decimalSymbol = ".";
		}

		if (this.config.hideTemp === false) {
			var weatherIcon = document.createElement("span");
			weatherIcon.className = "wi weathericon " + this.weatherType;
			large.appendChild(weatherIcon);

			var temperature = document.createElement("span");
			temperature.className = "bright";
			temperature.innerHTML = " " + this.temperature.toPrecision(4).replace(".", this.config.decimalSymbol) + degreeLabel;
			large.appendChild(temperature);
		}

		if (this.config.showIndoorTemperature && this.indoorTemperature) {
			var indoorIcon = document.createElement("span");
			indoorIcon.className = "fa fa-home";
			large.appendChild(indoorIcon);

			var indoorTemperatureElem = document.createElement("span");
			indoorTemperatureElem.className = "bright";
			indoorTemperatureElem.innerHTML = " " + this.indoorTemperature.replace(".", this.config.decimalSymbol) + degreeLabel;
			large.appendChild(indoorTemperatureElem);
		}

		if (this.config.showIndoorHumidity && this.indoorHumidity) {
			var indoorHumidityIcon = document.createElement("span");
			indoorHumidityIcon.className = "fa fa-tint";
			large.appendChild(indoorHumidityIcon);

			var indoorHumidityElem = document.createElement("span");
			indoorHumidityElem.className = "bright";
			indoorHumidityElem.innerHTML = " " + this.indoorHumidity + "%";
			large.appendChild(indoorHumidityElem);
		}

		wrapper.appendChild(large);

		if (this.config.showFeelsLike && this.config.onlyTemp === false) {
			var small = document.createElement("div");
			small.className = "normal medium";

			var feelsLike = document.createElement("span");
			feelsLike.className = "dimmed";
			feelsLike.innerHTML = this.translate("FEELS") + " " + this.feelsLike + degreeLabel;
			small.appendChild(feelsLike);

			wrapper.appendChild(small);
		}

		return wrapper;
	},

	// Override getHeader method.
	getHeader: function () {
		return this.fetchedLocationName;
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.appendLocationNameToHeader) {
				this.hide(0, { lockString: this.identifier });
			}
		}
		if (notification === "CALENDAR_EVENTS") {
			var senderClasses = sender.data.classes.toLowerCase().split(" ");
			if (senderClasses.indexOf(this.config.calendarClass.toLowerCase()) !== -1) {
				this.firstEvent = false;

				for (var e in payload) {
					var event = payload[e];
					if (event.location || event.geo) {
						this.firstEvent = event;
						//Log.log("First upcoming event with location: ", event);
						break;
					}
				}
			}
		}
	},

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function () {
		var url = this.config.apiBase + "all/";
		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = true;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function () {
		var params = "?";
		if (this.config.locationID) {
			params += "id=" + this.config.locationID;
		} else if (this.config.location) {
			params += "q=" + this.config.location;
		} else if (this.firstEvent && this.firstEvent.geo) {
			params += "lat=" + this.firstEvent.geo.lat + "&lon=" + this.firstEvent.geo.lon;
		} else if (this.firstEvent && this.firstEvent.location) {
			params += "q=" + this.firstEvent.location;
		} else {
			this.hide(this.config.animationSpeed, { lockString: this.identifier });
			return;
		}

		params += "&units=" + this.config.units;
		params += "&lang=" + this.config.lang;
		params += "&APPID=" + this.config.appid;

		return params;
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function (data) {
		if (!data || !data.temperature || typeof data.temperature === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.humidity = parseFloat(data.humidity);
		this.fetchedLocationName = "Indoors";
		
		switch (this.config.units) {
			case "metric":
				this.temperature = this.roundValue(data.temperature);
				break;
			case "imperial":
				this.temperature = 1.8 * (this.roundValue(data.temperature)) + 32;
				break;
			case "default":
				this.temperature = this.roundValue(data.temperature);
				break;
		}

		this.show(this.config.animationSpeed, { lockString: this.identifier });
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
		this.sendNotification("CURRENTINDOORWEATHER_DATA", { data: data });
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function () {
			self.updateWeather();
		}, nextLoad);
	},

	/* ms2Beaufort(ms)
	 * Converts m2 to beaufort (windspeed).
	 *
	 * see:
	 *  https://www.spc.noaa.gov/faq/tornado/beaufort.html
	 *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
	 *
	 * argument ms number - Windspeed in m/s.
	 *
	 * return number - Windspeed in beaufort.
	 */
	ms2Beaufort: function (ms) {
		var kmh = (ms * 60 * 60) / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	deg2Cardinal: function (deg) {
		if (deg > 11.25 && deg <= 33.75) {
			return "NNE";
		} else if (deg > 33.75 && deg <= 56.25) {
			return "NE";
		} else if (deg > 56.25 && deg <= 78.75) {
			return "ENE";
		} else if (deg > 78.75 && deg <= 101.25) {
			return "E";
		} else if (deg > 101.25 && deg <= 123.75) {
			return "ESE";
		} else if (deg > 123.75 && deg <= 146.25) {
			return "SE";
		} else if (deg > 146.25 && deg <= 168.75) {
			return "SSE";
		} else if (deg > 168.75 && deg <= 191.25) {
			return "S";
		} else if (deg > 191.25 && deg <= 213.75) {
			return "SSW";
		} else if (deg > 213.75 && deg <= 236.25) {
			return "SW";
		} else if (deg > 236.25 && deg <= 258.75) {
			return "WSW";
		} else if (deg > 258.75 && deg <= 281.25) {
			return "W";
		} else if (deg > 281.25 && deg <= 303.75) {
			return "WNW";
		} else if (deg > 303.75 && deg <= 326.25) {
			return "NW";
		} else if (deg > 326.25 && deg <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	},

	/* function(temperature)
	 * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
	 *
	 * argument temperature number - Temperature.
	 *
	 * return string - Rounded Temperature.
	 */
	roundValue: function (temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		return parseFloat(temperature).toFixed(decimals);
	}
});
