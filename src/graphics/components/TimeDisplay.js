const TimeDisplay = ({ runnerData, time }) => {
  if (runnerData && runnerData.forfeit) {
    return ''
  }
  if (runnerData && runnerData.time) {
    return runnerData.time.formatted !== '00:00' ? runnerData.time.formatted : ''
  }
  if (time && time.formatted && time.formatted !== '00:00') {
    return time.formatted
  }
  return ''
}

export default TimeDisplay
