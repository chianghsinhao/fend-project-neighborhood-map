import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
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

    locations: [
      {
        name: 'Poke Bar',
        id: 'poke-bar-san-jose',
        position: { lat: 37.321980, lng: -121.948150 },
        address: '3055 Olin Ave, Ste 1045, San Jose, CA 95128'
      } , {
        name: 'Poke House',
        id: 'poke-house-san-jose-6',
        position: { lat: 37.361040, lng: -121.946928 },
        address: '1308 S Winchester Blvd, San Jose, CA 95128'
      } , {
        name: 'Poke Paradise',
        id: 'poke-paradise-san-jose-2',
        position: { lat: 37.319320, lng: -121.974340 },
        address: '455 Saratoga Ave, San Jose, CA 95129'
      } , {
        name: 'Ono Poke Bowl',
        id: 'ono-poke-bowl-santa-clara-2',
        position: { lat: 37.344540, lng: -121.933230 },
        address: '2251 The Alameda, Santa Clara, CA 95050'
      } , {
        name: 'Poke Poke Fish Bar',
        id: 'poke-poke-fish-bar-santa-clara',
        position: { lat: 37.351910, lng: -121.967499 },
        address: '2362 El Camino Real, Santa Clara, CA 95050'
      }
    ]
  }

  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    })
  };

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  };

  render() {
    return (
      <div>
        <div>Poke Map</div>
        <input
          type="text"
          value={this.state.query}
          placeholder="Filter with address or City"
        />

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
        >
          {this.state.locations.map(x => (
            <Marker
              onClick={this.onMarkerClick}
              key={x.id}
              name={x.name}
              position={x.position}
            />
          ))}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
            onClose={this.onInfoWindowClose}
          >
            <div>
              <h2>{this.state.selectedPlace.name}</h2>
              <p>{this.state.selectedPlace.address}</p>
              <p>{this.state.selectedPlace.id}</p>
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
