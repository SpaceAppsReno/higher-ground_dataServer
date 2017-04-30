/**
 * Created by BNB on 4/30/2017.
 */

var util = require('util');
var http = require('http');
var formatUrl = "http://data1.gfdl.noaa.gov:9192/opendap/gfdl_cm2_1/CM2.1U-H2_SresA1FI_Z1/pp/atmos/ts/annual/ts_A0.2001-2100.nc.ascii?ts[%s][%s][%s]";

//regex to get the time
var timeRegex = /time=[0-9.]*/;
var latRegex = /lat=[0-9.]*/;
var years = [182.5,547.5,912.5,1277.5,1642.5,2007.5,2372.5,2737.5,3102.5,3467.5,3832.5,4197.5,4562.5,4927.5,5292.5,5657.5,6022.5,6387.5,6752.5,7117.5,7482.5,7847.5,8212.5,8577.5,8942.5,9307.5,9672.5,10037.5,10402.5,10767.5,11132.5,11497.5,11862.5,12227.5,12592.5,12957.5,13322.5,13687.5,14052.5,14417.5,14782.5,15147.5,15512.5,15877.5,16242.5,16607.5,16972.5,17337.5,17702.5,18067.5,18432.5,18797.5,19162.5,19527.5,19892.5,20257.5,20622.5,20987.5,21352.5,21717.5,22082.5,22447.5,22812.5,23177.5,23542.5,23907.5,24272.5,24637.5,25002.5,25367.5,25732.5,26097.5,26462.5,26827.5,27192.5,27557.5,27922.5,28287.5,28652.5,29017.5,29382.5,29747.5,30112.5,30477.5,30842.5,31207.5,31572.5,31937.5,32302.5,32667.5,33032.5,33397.5,33762.5,34127.5,34492.5,34857.5,35222.5,35587.5,35952.5,36317.5]

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
        this.latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat - latDiff);
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

NoaaData.prototype.GetDataSweepYear = function(YearString, callback){
    http.get(util.format(formatUrl, YearString, this.latString, this.lonString), function (res) {
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
                        var time = timeRegex.exec(line)[0];
                        time = parseFloat(time.substring(time.indexOf('=')+1))
                        var yearIndex = years.indexOf(time);
                        var latString = latRegex.exec(line)[0];
                        var latValue = parseFloat(latString.substring(latString.indexOf('=')+1));
                        if (latArray.indexOf(latValue) < 0){
                            latArray.push(latValue);
                        }
                        var temps = line.split(', ');
                        temps = temps.splice(1);
                        for (var index = 0; index < longitudes.length; index++) {
                            var dataEntry = {lat:latValue, lon: longitudes[index], temp:(parseFloat(temps[index])-273.15.toPrecision(4)), year:yearIndex};
                            dataLines.push(dataEntry)
                        }
                    }

                });
                var sendData = {};
                sendData.lons = longitudes;
                sendData.lats = latArray;
                var data = [];
                for (var latIndex = 0; latIndex < latArray.length; latIndex++){
                    data[latIndex] = [];
                    for(var lonIndex = 0; lonIndex < longitudes.length; lonIndex++){
                        data[latIndex][lonIndex] = 0;
                    }
                }

                for (var index = 0; index < dataLines.length; index++){
                    var latIndex = sendData.lats.indexOf(dataLines[index].lat);
                    var lonIndex = sendData.lons.indexOf(dataLines[index].lon);
                    data[latIndex][lonIndex] = dataLines[index].temp;
                    sendData.data[dataLines[index].year.toString()].data = data;
                }

                console.log(sendData);
                return callback(sendData);

            } catch (e) {
                return callback(e);
            }
        });
    });

}




