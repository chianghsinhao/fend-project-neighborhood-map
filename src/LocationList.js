import React from 'react'
import LocationItem from './LocationItem'

function LocationList(props) {
  return (
    <div>
      <ul className="restaurant-list">{
        (props.locations && props.locations.length > 0) ?
         props.locations.map((l,idx) => (
            <LocationItem
              key={l.id}
              onClick={props.onClick}
              location={l}
              locationIdx={idx}
            />
        )) : (
          <li key="0">No data to display...</li>
        )
      }</ul>
    </div>
  )
}

export default LocationList
