import React from 'react'
import Setup from '../layouts/Setup'

// Render a layout depending on 'layout' replicant value
const Router = props => {
  switch (props.layout) {
    default:
      // Fallback to game for unknown layouts
      return <Setup {...props} />
  }
}

export default Router
