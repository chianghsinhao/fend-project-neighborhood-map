import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import escapeRegExp from 'escape-string-regexp'
import logo from './logo.svg';
import './App.css';

const largeMapStyles = {
  position: 'relative',
  left: '0',
  width: 'calc(100% - 400px)',
  height: '100%'
}

const smallMapStyles = {
  position: 'relative',
  left: '0',
  width: '100%',
  height: '100%'
}

let resizeTimer

export class MapContainer extends Component {
  state = {
    mapStyles: largeMapStyles,
    largeMedia: true,
    showingSidebar: false,
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    locations: [],
    query: ''
  }

  /* List click event */
  onListClick(name) {
    // todo
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

  resizeMap() {
    let vm = this;
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(function() {
      var w = window.innerWidth
              || document.documentElement.clientWidth
              || document.body.clientWidth;
      console.log(w)
      console.log(vm.state)
      if (w < 850) {
        if (!vm.state.largeMedia) return
        vm.setState({ largeMedia: false })
        vm.setState({ mapStyles: smallMapStyles });
        vm.closeNav()
      }
      else {
        if (vm.state.largeMedia) return
        vm.setState({ largeMedia: true })
        vm.setState({ mapStyles: largeMapStyles });
        vm.openNav()
      }
    }, 250)
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

    let vm = this
    window.addEventListener('resize', function() {
      vm.resizeMap()
    })
    this.resizeMap()
  }

  openNav() {
    document.getElementsByTagName('nav')[0].classList.remove('nav-close')
    document.getElementsByTagName('nav')[0].classList.add('nav-open')
  }

  closeNav() {
    document.getElementsByTagName('nav')[0].classList.remove('nav-open')
    document.getElementsByTagName('nav')[0].classList.add('nav-close')
  }

  toggleNav() {
    console.log(this.state.showingSidebar)
    if (this.state.showingSidebar) {
      console.log('close nav')
      this.closeNav()
      this.setState({ showingSidebar: false })
    }
    else {
      console.log('open nav')
      this.openNav()
      this.setState({ showingSidebar: true })
    }
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
        <nav>
          <a
            href="javascript:void(0)"
            className="menu-icon"
            onClick={() => {this.toggleNav()}}>
            &#9776;
          </a>
        <h1>Poke Map</h1>
        <p>
          Click the restaurant from the list or use text to filter:
        </p>
        <input
          className="input-filter"
          type="text"
          size="40"
          value={this.state.query}
          placeholder="Filter with restaurant name or address"
          onChange={(event) => { this.updateQuery(event.target.value)} }/>
        <ul className="restaurant-list">{
          showingLocations.map((x) => (
            <li
              key={x.id}
              onClick={(e) => {
                this.onListClick(e.target.value)
              }}
            >
              {x.name}
            </li>
          ))
        }</ul>
        </nav>
        <Map
          className="map"
          google={this.props.google}
          zoom={13}
          style={this.state.mapStyles}
          initialCenter={{
           lat: 37.334356,
           lng: -121.952371
          }}
          onClick={this.onMapClicked}
          bounds={bounds}
          mapTypeControl={false}
          resetBoundsOnResize={true}>
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
            onClose={this.onInfoWindowClose}>
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
