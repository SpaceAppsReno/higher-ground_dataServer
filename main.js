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
var formatUrl = "http://data1.gfdl.noaa.gov:9192/opendap/gfdl_cm2_1/CM2.1U-H2_SresA1FI_Z1/pp/atmos/ts/annual/ts_A0.2001-2100.nc.ascii?ts[%s][%d][%d]";

var CoordinateConverter = require('CoordinateConverter');
var cc = new coordinateConverter('./data/lat.csv', './data/lon.csv');

http.get(util.format(formatUrl, '0:1:99', 39, 143), function (res) {
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function(chunk) { rawData += chunk; });
    res.on('end', function() {
        try {
            var lines = rawData.split("\n");
            var dataLines = [];
            lines.forEach(function(line){
                if (line.indexOf("ts.ts[") > -1){
                    line = line.substring(line.indexOf('['));
                    var dataSet = line.split(', ');
                    dataSet[0] = dataSet[0].substring(dataSet[0].indexOf('=')+1, dataSet[0].indexOf(']'));
                    //At this point the datalines is now [Time]; 0 = [degreesInKelvin];
                    dataLines.push(dataSet);
                }
            });

            console.log(dataLines, dataLines.length);


        } catch (e) {
            console.error(e.message);
        }
    });
});

//http.get('http://nodejs.org/dist/index.json', (res) => {
