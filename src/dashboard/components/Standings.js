import React from 'react'

const Standings = ({ bestOf, standing, index, didWin }) => {
  let winCount = standing && standing.record ? parseInt(standing.record) : 0
  if (isNaN(winCount)) {
    winCount = 0
  }

  if (didWin) {
    winCount++
  }
  const buffer = []

  const maxCount = Math.floor(bestOf / 2) + 1

  for (let i = 1; i <= maxCount; i++) {
    buffer.push(<img key={i} style={{ width: `${Math.round(120 / Math.max(maxCount, 2))}px`, padding: '3px' }} className={`runner${index} win${i} win`} src={winCount >= i ? 'assets/images/triforce-on.png' : 'assets/images/triforce-off.png'}/>)
  }

  return (
    <div className={`standings bo${bestOf}`}>
      {buffer}
    </div>
  )
}

export default Standings
