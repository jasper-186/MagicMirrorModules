Module.register("indoorweather",{
    // Default module config.
    defaults: {
    	indoorUrl: "http://192.168.0.30/all",
        updateInterval: 0.5, // Minutes
	units: "imperial",
    },

    // Define start sequence.
    start: function() {
	Log.info("asdf");
	Log.log("Starting module: " + this.name);
	this.loaded = false;
        this.update();
        setInterval(this.update.bind(this), this.config.updateInterval * 60 * 1000);
    },

    update: function(){
        Log.info("Info - Sending request to indoorweather");
	Log.info("Log - Sending request to indoorweather");
	Log.info("console - Sending request to indoorweather");
        this.sendSocketNotification('INDOORWEATHERREQUEST', this.config);
    },

    // Override dom generator.
    /*
    getDom: function() {
    	var wrapper = document.createElement("div");
    	wrapper.className = "light small";
	if (!this.loaded) {
		wrapper.innerHTML = "Loading ...";
		wrapper.className = "dimmed light small";
		return wrapper;
	}
	var temp = document.createElement("div");
        temp.innerHTML = "Temperatur: " + this.temperature + " °C";
        wrapper.appendChild(temp);
        var hum = document.createElement("div");
        hum.innerHTML = "Luftfeuchtigkeit: " + this.humidity + " %";
        wrapper.appendChild(hum);
        return wrapper;
    },
    */

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'INDOORWEATHER_TEMPERATURE') {
            this.sendNotification('INDOOR_TEMPERATURE',payload);
        }
	if (notification === 'INDOORWEATHER_HUMIDITY') {
            this.sendNotification('INDOOR_HUMIDITY',payload);
        }
    }
});
