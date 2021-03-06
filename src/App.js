import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import escapeRegExp from 'escape-string-regexp'
import { Offline, Online } from 'react-detect-offline'
import LocationList from './LocationList'
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
    query: '',
    markerRefs: [],
    navClassList: []
  }

  /* List click event; use a list of refs to access the
     marker object  */
  onListClick(name, idx) {
    let selectedPlace = this.state.locations[idx]
    this.setState({
      selectedPlace: selectedPlace,
      activeMarker: this.state.markerRefs[idx].current.marker,
      showingInfoWindow: true
    })
    this.closeNav()
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
    window.gm_authFailure = () => {
      // Tell the user that something went wrong
      alert('Error in Google Maps API!')
    };

    /* Fetch from foursqure db */
    fetch('https://api.foursquare.com/v2/venues/search?query=poke&near=san_jose_california&client_id=DVUPBKUDATRBTG2Z3YDFZFSO3D3N5P1DNRIM1URYA141DTEC&client_secret=SEFHXJ4ZFLZBLIGDBQ2AL4TR1K3QOZNI1XTK1HW35RLSLGGM&v=20181113')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.setState({locations: data.response.venues})

        let refs = []
        /* Create marker for each entry */
        for (let i = 0; i < data.response.venues.length; i++) {
          let ref = React.createRef()
          refs.push(ref)
        }
        this.setState({ markerRefs: refs})
        this.resizeMap()
      })
      .catch((err) => {
        console.log('error in fetch', err)
        alert('error in Foursquare API fetch!', err)
        this.resizeMap()
        this.openNav()
      })

    let vm = this
    window.addEventListener('resize', function() {
      vm.resizeMap()
    })
  }

  openNav() {
    let newNavClassList = ['nav-open']
    this.setState({
      navClassList: newNavClassList,
      showingSidebar: true
    })
  }

  closeNav() {
    if (this.state.largeMedia) return
    let newNavClassList = ['nav-close']
    this.setState({
      navClassList: newNavClassList,
      showingSidebar: false
    })
  }

  toggleNav() {
    if (this.state.showingSidebar) {
      this.closeNav()
    }
    else {
      this.openNav()
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

    let bounds = new this.props.google.maps.LatLngBounds();
    /* Extends bounds for displaying restaurants */
    if (showingLocations) {
      for (let i = 0; i < showingLocations.length; i++) {
        bounds.extend({
          lat: showingLocations[i].location.lat,
          lng: showingLocations[i].location.lng
        })
      }
    }

    return (
      <div>
        <Online>
          <nav
            className={this.state.navClassList.join(' ')}>
            <a
              href="javascript:void(0)"
              className="menu-icon"
              onClick={() => {this.toggleNav()}}
              aria-label="Menu Icon">
              &#9776;
            </a>
          <h1>San Jose Poke Map</h1>
          <p>
            Data provided by <em>Foursquare API</em>
          </p>
          <p>
            Click the restaurant from the list or use text to filter:
          </p>
          <input
            className="input-filter"
            type="text"
            size="40"
            value={this.state.query}
            placeholder="Filter with restaurant name or address"
            onChange={(event) => { this.updateQuery(event.target.value)} }
            arial-label="Restaurant filter"/>
          <LocationList
            locations={showingLocations}
            onClick={(name, idx) => {
              this.onListClick(name, idx)
            }}
          />
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
            resetBoundsOnResize={true}
            role="application"
            aira-label="Restaurant map application  ">
             {showingLocations && showingLocations.length? showingLocations.map((x, idx) => (
               <Marker
                 onClick={this.onMarkerClick}
                 key={x.id}
                 name={x.name}
                 ref={this.state.markerRefs[idx]}
                 position={{ lat: x.location.lat, lng: x.location.lng }}
                 animation={/* If marker is active, make it bounce */
                            this.state.markerRefs[idx] &&
                            this.state.markerRefs[idx].current &&
                            this.state.markerRefs[idx].current.marker === this.state.activeMarker?
                            this.props.google.maps.Animation.BOUNCE:
                            null}>
               </Marker>
             )):''}
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
        </Online>
        <Offline>
          <p className="offline-notice">No network connection!</p>
        </Offline>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAK1W3_NH5OrZAO4oBzKmyX7Xz_OiplUgo'
})(MapContainer);
