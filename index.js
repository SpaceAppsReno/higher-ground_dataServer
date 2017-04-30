/**
 * Created by BNB on 4/29/2017.
 */

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors = require('cors');
var NoaaData = require('./NoaaData');
var Noaa = new NoaaData();


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/test', function(req, res) {
    var coordinatePack = {
    east: -119.75490311964109,
        north: 39.538635617749755,
    south: 39.51195501951582,
    west: -119.87841348035886,
    };
    console.log(JSON.stringify(coordinatePack));
    Noaa.resolveParameters(coordinatePack, 2005);
    Noaa.GetData(function(result){
        res.json(result);
    });
});
router.get('/heat', function(req, res){
    var coordinates = {
        east: parseFloat(req.query.bounds_east),
        west: parseFloat(req.query.bounds_west),
        north: parseFloat(req.query.bounds_north),
        south: parseFloat(req.query.bounds_south)
    };
    // coordinates = JSON.parse(coordinates);
    var year = parseFloat(req.query.year);

    Noaa.resolveParameters(coordinates, year);
    Noaa.GetData(function(result){
        res.json(result);
    });
});

router.post('/heatOverTime', function(req, res){
    var coordinates = req.body.coordinates;
    var startYear = req.body.startYear;
    var endYear = req.body.endYear;

    startYearIndex = startYear - 2001;
    endYearIndex = endYear - 2001;
    var yearString = startYearIndex.toString();
    if ((endYearIndex - startYearIndex) > 0) {
        yearString = require('util').format("%s:%s", startYearIndex, endYearIndex);
    }

    Noaa.resolveParameters(coordinates, startYear);
    Noaa.GetDataSweepYear(yearString, function(result){
        res.json(result);
    });
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use(router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
//Here create a REST Api to use.


