/**
 * Created by BNB on 4/29/2017.
 */
// const fs = require('fs');
// const NetCDFReader = require('netcdfjs');
//
// // http://www.unidata.ucar.edu/software/netcdf/examples/files.html
// const data = fs.readFileSync('./data/ts_A0.2001-2100.nc');
//
// var reader = new NetCDFReader(data); // read the header
// //var ts = reader.getDataVariable('ts'); // go to offset and read it
// console.log(reader.variables);
// var variables = reader.variables;
// for(var index = 0; index < variables.length; index++){
//     console.log(variables[index].name, variables[index].attributes);
// }
//

var util = require('util');
var http = require('http');
var formatUrl = "http://data1.gfdl.noaa.gov:9192/opendap/gfdl_cm2_1/CM2.1U-H2_SresA1FI_Z1/pp/atmos/ts/annual/ts_A0.2001-2100.nc.ascii?ts[%s][%s][%s]";

//regex to get the time
var timeRegex = /time=[0-9.]*/;
var latRegex = /lat=[0-9.]*/;


var CoordinateConverter = require('./CoordinateConverter');
var cc = new coordinateConverter('./data/lat.csv', './data/lon.csv');
//west
var coordinates2 = cc.getCoordinateIndexes(39, -119.5);
//east
var coordinates1 = cc.getCoordinateIndexes(45, -118.0);

var latString = coordinates1.lat.toString();
var lonString = coordinates1.lon.toString();

var latDiff = (coordinates1.lat - coordinates2.lat);
var lonDiff = (coordinates1.lon - coordinates2.lon);
if (latDiff > 0){
    latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat + latDiff);
} else if (latDiff < 0){
    latString = util.format("%d:%d",coordinates1.lat, coordinates1.lat - lonDiff);
}

if (lonDiff > 0){
    lonString = util.format("%d:%d",coordinates1.lon, coordinates1.lon + lonDiff);
} else if (lonDiff < 0){
    lonString = util.format("%d:%d",coordinates1.lon, coordinates1.lon - lonDiff);
}


http.get(util.format(formatUrl, '1', latString, lonString), function (res) {
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
                        var dataEntry = {lat:latValue, lon: longitudes[index], temp:(parseFloat(temps[index])-273.15).toPrecision(4)};
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


        } catch (e) {
            console.error(e.message);
        }
    });
});

