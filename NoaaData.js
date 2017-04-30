/**
 * Created by BNB on 4/30/2017.
 */

var util = require('util');
var http = require('http');
var formatUrl = "http://data1.gfdl.noaa.gov:9192/opendap/gfdl_cm2_1/CM2.1U-H2_SresA1FI_Z1/pp/atmos/ts/annual/ts_A0.2001-2100.nc.ascii?ts[%s][%s][%s]";

//regex to get the time
var timeRegex = /time=[0-9.]*/;
var latRegex = /lat=[0-9.]*/;

var CoordinateConverter = require('./CoordinateConverter');
var cc = new coordinateConverter('./data/lat.csv', './data/lon.csv');

module.exports = NoaaData = function(){

};


NoaaData.prototype.resolveParameters = function(coordinatePack, year){
    var lat1 = coordinatePack.south;
    var lat2 = coordinatePack.north;
    var lon1 = coordinatePack.east;
    var lon2 = coordinatePack.west;

    var coordinates1 = cc.getCoordinateIndexes(lat1, lon1);
    var coordinates2 = cc.getCoordinateIndexes(lat2, lon2);

    this.latString = coordinates1.lat.toString();
    this.lonString = coordinates1.lon.toString();

    var latDiff = (coordinates1.lat - coordinates2.lat);
    var lonDiff = (coordinates1.lon - coordinates2.lon);
    if (latDiff > 0){
        this.latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat + latDiff);
    } else if (latDiff < 0){
        this.latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat - lonDiff);
    }

    if (lonDiff > 0){
        this.lonString = util.format("%d:%d",coordinates1.lon, coordinates1.lon + lonDiff);
    } else if (lonDiff < 0){
        this.lonString = util.format("%d:%d",coordinates1.lon, coordinates1.lon - lonDiff);
    }

    var yearIndex = year-2001;
    this.yearIndex = yearIndex.toString();

}

NoaaData.prototype.GetData = function(callback){
    http.get(util.format(formatUrl, this.yearIndex, this.latString, this.lonString), function (res) {
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', function(chunk) { rawData += chunk; });
        res.on('end', function() {
            try {
                var lines = rawData.split("\n");
                var dataLines = [];
                var longitudes = [];
                var latArray = [];
                lines.forEach(function(line){
                    if (line.indexOf("ts.lon") > -1){
                        //use this to get the longitude indexes
                        longitudes = line.split(", ");
                        longitudes = longitudes.splice(1);
                        for (var index = 0; index < longitudes.length; index++){
                            longitudes[index] = parseFloat(longitudes[index]);
                        }
                    }
                    //parse out the data
                    if (line.indexOf("ts.ts[") > -1){
                        var latString = latRegex.exec(line)[0];
                        var latValue = parseFloat(latString.substring(latString.indexOf('=')+1));
                        if (latArray.indexOf(latValue) < 0){
                            latArray.push(latValue);
                        }
                        var temps = line.split(', ');
                        temps = temps.splice(1);
                        for (var index = 0; index < longitudes.length; index++) {
                            var dataEntry = {lat:latValue, lon: longitudes[index], temp:(parseFloat(temps[index])-273.15.toPrecision(4))};
                            dataLines.push(dataEntry)
                        }
                    }

                });
                var sendData = {};
                sendData.lons = longitudes;
                sendData.lats = latArray;
                sendData.data = [];
                for (var latIndex = 0; latIndex < latArray.length; latIndex++){
                    sendData.data[latIndex] = [];
                    for(var lonIndex = 0; lonIndex < longitudes.length; lonIndex++){
                        sendData.data[latIndex][lonIndex] = 0;
                    }
                }

                for (var index = 0; index < dataLines.length; index++){
                    var latIndex = sendData.lats.indexOf(dataLines[index].lat);
                    var lonIndex = sendData.lons.indexOf(dataLines[index].lon);
                    sendData.data[latIndex][lonIndex] = dataLines[index].temp;

                }

                console.log(sendData);
                return callback(sendData);

            } catch (e) {
                return callback(e.message);
            }
        });
    });

}
//
// //west
// var coordinates2 = cc.getCoordinateIndexes(39, -119.5);
// //east
// var coordinates1 = cc.getCoordinateIndexes(45, -118.0);
//
// var latString = coordinates1.lat.toString();
// var lonString = coordinates1.lon.toString();
//
// var latDiff = (coordinates1.lat - coordinates2.lat);
// var lonDiff = (coordinates1.lon - coordinates2.lon);
// if (latDiff > 0){
//     latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat + latDiff);
// } else if (latDiff < 0){
//     latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat - lonDiff);
// }
//
// if (lonDiff > 0){
//     lonString = util.format("%d:%d",coordinates1.lon, coordinates1.lon + lonDiff);
// } else if (lonDiff < 0){
//     lonString = util.format("%d:%d",coordinates1.lon, coordinates1.lon - lonDiff);
// }



