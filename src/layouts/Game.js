import React from 'react'
import '../style/layout.css'
import '../style/sprites.css'
import '../style/restream.css'
import '../style/runner.css'
import TimeDisplay from '../components/TimeDisplay'
import Tracker from '../components/Tracker'
import Standings from '../components/Standings'

const Game = props => {
  if (!props.currentRun) {
    return null
  }
  const layout = props.currentRun && props.currentRun.runners && props.currentRun.runners.length > 2 ? 'runner4l' : 'runner2l'
  const showStandings = !!(props.currentRunExtra && props.currentRunExtra.stage && props.currentRunExtra.stage === 2)
  return (

    <div id='container'>
      <div className={layout}>
        <img id='background' src='assets/backgrounds/bg2-blank.png' />
        <img id='background2' src='assets/backgrounds/fall2018qual.png' />
        {props.currentRun
          ? props.currentRun.runners.map((runner, index) => {
            const runnerData = props.stopwatch && props.stopwatch.results && props.stopwatch.results[index]
            const didWin = runnerData && !runnerData.forfeit && runnerData.place === 1
            const canWin = props.currentRunExtra && props.currentRunExtra.stage !== 0
            const didForfeit = runnerData && runnerData.forfeit
            return (
              <div id={'runner' + index} className={layout} key={runner.name}>
                <div className='runnerName textShadow'>
                  {runner.name}
                </div>
                <div className='runnerTimer textShadow'>
                  {/* props.stopwatch && <TimeDisplay runnerData={runnerData} time={props.stopwatch.time} /> */}
                </div>
                <div className='runnerStream' />
                {props.currentRunExtra && props.currentRunExtra.itemTrackers && props.currentRunExtra.itemTrackers[index] &&
                  <Tracker
                    itemTracker={props.currentRunExtra.itemTrackers[index]}
                    keysanity={props.currentRunExtra.variationsEnabled && props.currentRunExtra.variationsMode === 'bg-keysanity'}
                    password={props.currentRunExtra.password}
                    layout={layout === 'runner4l' ? '4' : '2'}
                  />}
                <div className='runnerExtra'>
                  {showStandings &&
                    <Standings
                      bestOf={props.currentRunExtra.seriesMatches}
                      standing={props.currentRunExtra.standings && props.currentRunExtra.standings[index]}
                      index={index}
                      didWin={runnerData && !runnerData.forfeit && runnerData.place === 1}
                    />}
                  <div className='status'>
                    {canWin && didWin && <img src='assets/images/winner.png' />}
                    {!canWin && runnerData && runnerData.place > 0 && <img src='assets/images/finished.png' />}
                    {didForfeit && <img src='assets/images/forfeit.png' />}
                  </div>
                </div>
              </div>
            )
          }) : ''}
        <div id='commentators' className='textShadow'>
          <img src='assets/images/commentator.png' /> {props.currentRun && props.currentRun.commentators.map(x => x.name).join(', ')}
        </div>
        <div id='matchInfo' className='textShadow'>
          {props.currentRunExtra && props.currentRunExtra.title1}
          {props.currentRunExtra && props.currentRunExtra.variationsEnabled &&
            <div>
              <i className={`sprite ${props.currentRunExtra.variationsGoal}`} />
              <i className={`sprite ${props.currentRunExtra.variationsGame}`} />
              <i className={`sprite ${props.currentRunExtra.variationsSword}`} />
              <i className={`sprite ${props.currentRunExtra.variationsDifficulty}`} />
              <i className={`sprite ${props.currentRunExtra.variationsMode}`} />
            </div>}
          {props.currentRunExtra && !props.currentRunExtra.variationsEnabled &&
            <div>
              {props.currentRunExtra && props.currentRunExtra.title2}
            </div>}
        </div>
      </div>
    </div>
  )
}

export default Game
