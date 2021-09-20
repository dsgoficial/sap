import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import AssignmentIcon from '@mui/icons-material/Assignment';
import Settings from '@material-ui/icons/Settings'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'

import styles from './styles'
import validationSchema from './validation_schema'
import { handleLogin } from './api'
import LoginForm from './login_form'
import { handleApiError } from '../services'

import { MessageSnackBar, BackgroundImages } from '../helpers'

const Login = withRouter(props => {
  const classes = styles()
  const values = { usuario: '', senha: '' }

  const [snackbar, setSnackbar] = useState('')

  const handleForm = async (values) => {
    try {
      const success = await handleLogin(values.usuario, values.senha)
      if (success) props.history.push('/')
    } catch (err) {
      handleApiError(err, setSnackbar)
    }
  }

  return (
    <BackgroundImages>
      <div className={classes.overflow}>
        <Container component='main' maxWidth='xs'>
          <Paper className={classes.paper}>
            <AssignmentIcon className={classes.avatar}>
              <Settings />
            </AssignmentIcon>
            <Typography component='h1' variant='h5'>
              Sistema de Apoio à Produção
            </Typography>
            <LoginForm
              initialValues={values}
              validationSchema={validationSchema}
              onSubmit={handleForm}
            />
          </Paper>
        </Container>
        {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
      </div>
    </BackgroundImages>
  )
})

export default Login