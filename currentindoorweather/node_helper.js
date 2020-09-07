'use strict';

const NodeHelper = require('node_helper');
const exec = require('child_process').exec;
//const https = require('https');
const http = require('http');
module.exports = NodeHelper.create({
    start: function () {
        console.log('Current Indoor Weather helper started ...');
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        const self = this;
        /*
        if (notification === 'INDOORWEATHERREQUEST') {
        const self = this
        // this.config = payload
        // console.log('indoorweather recieved request');
        // console.log('indoorUrl: "' + payload.indoorUrl + '"');
        // execute external DHT Script
        http.get(payload.indoorUrl,(resp)=>{
        let data="";

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
        data += chunk;
        });

        resp.on('end',()=>{
        // console.log('update data: "'+ data + '"');
        var result = JSON.parse(data);
        var tempResult=0;
        switch (payload.units) {
        case "metric":
        tempResult = result.temperature;
        break;
        case "imperial":
        tempResult = ((9/5)*result.temperature)+32;
        break;
        case "kelvin":
        tempResult = (result.temperature - 273.15);
        break;
        }
        //console.log('indoorweather sending update ('+result.temperature + "," + result.humidity + ")");
        self.sendSocketNotification('INDOORWEATHER_TEMPERATURE', tempResult);
        self.sendSocketNotification('INDOORWEATHER_HUMIDITY', result.humidity);
        });
        }).on("error",(err) => {
        console.log("Error: " + err.message);
        });
        }
         */
    }
});
