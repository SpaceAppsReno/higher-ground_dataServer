# Higher Ground Data Server
This is the repo for the dataServer that compiles the data from the NOAA datasets and formats it in a more web-tech readable format.

The API is running on azure at this website: http://higher-ground.azurewebsites.net/

###API

#### GET: /test

This is a quick test it uses the following static data to show a data point

    Coordinates: = {
                     east: -119.75490311964109,
                     north: 39.538635617749755,
                     south: 39.51195501951582,
                     west: -119.87841348035886,
                 };
    Year: 2005

#### GET: /heat

This is way to get the heat for a specific region and a single year the body data are as follows

QueryString: `/heat?year=2050&bounds_east=-118.75&bounds_west=-121.25&bounds_north=42.5730323791504&bounds_south=36.5056190490723`

Coordinates (in a json string) and a single year from 2001 - 2100

##### Returns:

    {
      "lons": [
        -121.25,
        -118.75
      ],
      "lats": [
        37.4157295227051,
        39.4382019042969,
        41.4606742858887,
        43.4831466674805
      ],
      "data": [
        [
          18.073999999999955,
          12.156999999999982
        ],
        [
          13.577999999999975,
          10.423999999999978
        ],
        [
          10.528999999999996,
          9.322000000000003
        ],
        [
          11.435000000000002,
          11.12299999999999
        ]
      ]
    }
    
