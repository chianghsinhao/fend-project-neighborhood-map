
This is the Udacitiy Frontend Nanodegree Project 7. A neighborhood map of poke restaurants are listed.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Instruction to run the test
Run `npm install`
Run `npm start`
Optionally you can replace the Google map and Foursquare API key

## Libraries
* [google-maps-react](https://github.com/fullstackreact/google-maps-react)
* [escape-string-regexp](https://www.npmjs.com/package/escape-string-regexp)
* [Google Map API](https://developers.google.com/maps/documentation/javascript/tutorial)
* [Foursquare API](https://developer.foursquare.com/docs)

# References
* [goole-maps-react tutorial](https://scotch.io/tutorials/react-apps-with-the-google-maps-api-and-google-maps-react)
* [Animated side nav menu](https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sidenav)

# Additional notes
* Foursquare API is used to fetch the restaurant list and location information.
* To resize map without making additional request, `resetBoundsOnResize` is passed to Map component.
* To make list clickable, an array of refs is setup to link with each marker.
* Responsiveness layout is designed so that the nav sidebar can be hidden on smaller screen.
* Text input can filter both the list items and markers on map.
* In the case of foursquare API error, an error message will display on sidebar
