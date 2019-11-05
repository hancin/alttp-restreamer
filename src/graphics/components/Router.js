import React from 'react'
import Game from '../layouts/Game'

// Render a layout depending on 'layout' replicant value
const Router = props => {
  switch (props.layout) {
    default:
      // Fallback to game for unknown layouts
      return <Game {...props} />
  }
}

export default Router
