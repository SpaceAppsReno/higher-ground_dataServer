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

####POST: /heat

This is way to get the heat for a specific region and a single year the body data are as follows

RawData from postman example:

    coordinates:{"east":-119.75490311964109,"north":39.538635617749755,"south":39.51195501951582,"west":-119.87841348035886}
    year:2005

Coordinates (in a json string) and a single year from 2001 - 2100

##### Returns:

    {
      "lons": [
        241.25
      ],
      "lats": [
        41.4606742858887
      ],
      "data": [
        [
          6.447999999999979
        ]
      ]
    }
    
