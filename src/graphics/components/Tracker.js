import React from 'react'

const Tracker = ({ itemTracker, password, keysanity, layout }) => {
  const baseUrl = window.nodecg.bundleConfig.tracker.url
  if (itemTracker && itemTracker.url) {
    const url = `${baseUrl}/${itemTracker.url}?password=${password}&layout=${layout}&keysanity=${keysanity}`
    return (
      <div style={{ position: 'absolute' }}>
        <div className={'tracker runner' + layout + 'l'}>
          <iframe width='1050' height='750' src={url} scrolling='no' />
        </div>
      </div>
    )
  }
  return <div style={{ position: 'absolute' }}><div className={'tracker runner' + layout + 'l'} /></div>
}

export default Tracker
