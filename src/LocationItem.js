import React from 'react'

function LocationItem(props) {
  return (
    <li
      onClick={(e) => {
        props.onClick(e.target.value, props.locationIdx)
      }}
      role="Button"
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.keyCode === 13) {
          props.onClick(e.target.value, props.locationIdx)
        }
      }}
    >
      {props.location.name}
    </li>
  )
}

export default LocationItem
