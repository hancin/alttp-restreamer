import React from 'react'
import ReactDOM from 'react-dom'
import NCGStore, { replicateMany } from '../stores/NodecgStore'
import Router from './components/Router'
import { Reset } from 'styled-reset'

const replicantNames = [
  'currentRun',
  'checklist',
  'stopwatch',
  'currentRunExtra'
]

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      replicants: NCGStore.getReplicants()
    }
  }

  componentDidMount () {
    // Subscribe to replicant changes
    replicateMany(...replicantNames)

    // We keep all our subscribed replicants in a single "replicants" object
    NCGStore.on('change', () => {
      this.setState({
        replicants: NCGStore.getReplicants()
      })
    })
  }

  render () {
    return (
      <>
        <Reset />
        <Router {...this.state.replicants} />
      </>
    )
  }
}

const root = document.getElementById('app')
ReactDOM.render(<App />, root)
