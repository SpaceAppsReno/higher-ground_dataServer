/**
 * Created by BNB on 4/29/2017.
 */
var fs = require('fs');
module.exports = coordinateConverter = function(latFile, lonFile){
    this.latitudes;
    this.longitudes;

    var latData = fs.readFileSync(latFile, 'utf8');
    this.latitudes = latData.split(',');
    for (var index = 0; index < this.latitudes.length; index++){
        this.latitudes[index] = parseFloat(this.latitudes[index]);
    }
    // console.log(this.latitudes);
    var lonData = fs.readFileSync(lonFile, 'utf8');
    this.longitudes = lonData.split(',');
    for (var index = 0; index < this.longitudes.length; index++){
        this.longitudes[index] = parseFloat(this.longitudes[index]);
    }
    // console.log(this.longitudes);
};

coordinateConverter.prototype.getCoordinateIndexes = function(lat, long){
    var returnCoordinates = {lat:0, lon:0};
    console.log(lat, long);
    // long = Math.abs(long);
    //do this to convert to 360 degrees.
    if (long < 0){
        long = long + 360;
    }
    for (var index = 0; index < this.latitudes.length-1; index++ ){
        if (lat > this.latitudes[index] && lat < this.latitudes[index+1]){
            console.log("found a good latitude", index, this.latitudes[index], this.latitudes[index+1]);
            returnCoordinates.lat = index+1;
            break;
        }else if (lat === this.latitudes[index]){
            returnCoordinates.lon = index;
            break;
        }
    }
    for (var index = 0; index < this.longitudes.length-1; index++ ){
        if (long > this.longitudes[index] && long < this.longitudes[index+1]){
            console.log("found a good longitude", index, this.longitudes[index], this.longitudes[index+1]);
            returnCoordinates.lon = index+1;
            break;
        } else if (long === this.longitudes[index]){
            returnCoordinates.lon = index;
            break;
        }
    }
    return returnCoordinates;


}