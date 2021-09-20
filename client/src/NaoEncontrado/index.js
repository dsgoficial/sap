import React from 'react'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import LinkMui from '@material-ui/core/Link'
import { makeStyles } from '@material-ui/core/styles'

const styles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}))

const NaoEncontrado = props => {
  const classes = styles()

  return (
    <div className={classes.root}>
      <div>
        <Typography variant='h1'>
          404
        </Typography>
      </div>
      <div>
        <Typography variant='h4' gutterBottom>
          Página não encontrada
        </Typography>
      </div>
      <div>
        <LinkMui to='/' variant='h6' component={Link}>
          Retorne a página principal
        </LinkMui>
      </div>
    </div>
  )
}

export default NaoEncontrado
