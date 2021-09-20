import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles(theme => ({
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}))

const SubmitButton = ({ submitting, disabled, children, ...rest }) => {
  const classes = useStyles()

  return (
    <div className={classes.wrapper}>
      <Button disabled={disabled || submitting} {...rest}>
        {children}
      </Button>
      {submitting && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
  )
}

export default SubmitButton
