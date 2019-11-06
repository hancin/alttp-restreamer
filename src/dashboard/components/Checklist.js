import React from 'react'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'

const Checklist = (props) => {
  if(!props.checklist) {
    return null
  }

  const handleToggle = value => () => {
    //value.completed = !value.completed;
  }

  return (
    <>
      <section>
        <Typography variant="h6">
          Preparation
        </Typography>
        <List className='checkList'>
          {props.checklist.techStationDuties.map((todo,index) => {
            const labelId = `tsd-todo-label-${index}`
            return (
              <ListItem key={todo.name} role={undefined} dense button onClick={handleToggle(todo)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={todo.completed}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={todo.name} />
              </ListItem>
            )
          })}
        </List>
      </section>
      <section>
        <Typography variant="h6">
          Pre-Commentary live
        </Typography>
        ✅
      </section>
      <section>
        <Typography variant="h6">
          Pre-Restream live
        </Typography>
        ✅
      </section>
    </>
  )
}

export default Checklist
