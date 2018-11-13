import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import escapeRegExp from 'escape-string-regexp'
import logo from './logo.svg';
import './App.css';

const mapStyles = {
  width: '100%',
  height: '100%'
};

export class MapContainer extends Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    locations: [],
    query: ''
  }

  /* Marker click event: set selected place, active marker and display infoWindow  */
  onMarkerClick = (props, marker, e) => {
    let selectedPlace = this.state.locations.filter(x => x.name === props.name)[0];

    this.setState({
      selectedPlace: selectedPlace,
      activeMarker: marker,
      showingInfoWindow: true
    })
  };

  /* Map click event: hide infoWindow if it's opened */
  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  };

  updateQuery(query) {
    this.setState({query})
  }

  componentDidMount() {
    /* Fetch from foursqure db */
    fetch('https://api.foursquare.com/v2/venues/search?query=poke&near=san_jose_california&client_id=DVUPBKUDATRBTG2Z3YDFZFSO3D3N5P1DNRIM1URYA141DTEC&client_secret=SEFHXJ4ZFLZBLIGDBQ2AL4TR1K3QOZNI1XTK1HW35RLSLGGM&v=20181113')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.setState({locations: data.response.venues})
      })
      .catch((err) => {
        console.log('error in fetch', err)
      })
  }

  render() {
    let {locations, selectedPlace, query} = this.state;

    /* Narrow list if query is used */
    let showingLocations;
    if (query) {
      const match = new RegExp(escapeRegExp(query), 'i')
      showingLocations = locations.filter((loc) =>
        match.test(loc.name) || match.test(loc.location.formattedAddress)
      )
    }
    else {
      showingLocations = locations
    }

    /* Extends bounds for displaying restaurants */
    let bounds = new this.props.google.maps.LatLngBounds();
    for (let i = 0; i < showingLocations.length; i++) {
      bounds.extend({
        lat: showingLocations[i].location.lat,
        lng: showingLocations[i].location.lng
      })
    }

    return (
      <div>
        <h1>Poke Map</h1>
        <input
          type="text"
          value={this.state.query}
          placeholder="Filter with restaurant name or address"
          onChange={(event) => { this.updateQuery(event.target.value)} }
        />
        <ul className="restaurant-list">{
          showingLocations.map((x) => (
            <li key={x.id}>{x.name}</li>
          ))
        }</ul>
        <Map
          className="map"
          google={this.props.google}
          zoom={13}
          style={mapStyles}
          initialCenter={{
           lat: 37.334356,
           lng: -121.952371
          }}
          onClick={this.onMapClicked}
          bounds={bounds}
        >
          {showingLocations.map(x => (
            <Marker
              onClick={this.onMarkerClick}
              key={x.id}
              name={x.name}
              position={{ lat: x.location.lat, lng: x.location.lng }}
            />
          ))}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
            onClose={this.onInfoWindowClose}
          >
            <div className="info-detail">
              <h2>{selectedPlace.name}</h2>
              <p>{(selectedPlace.location && selectedPlace.location.formattedAddress)?
                  selectedPlace.location.formattedAddress.join(', '):
                  'Address unknown'}</p>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAK1W3_NH5OrZAO4oBzKmyX7Xz_OiplUgo'
})(MapContainer);
