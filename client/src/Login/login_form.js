import React from 'react'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'

import styles from './styles'

import { SubmitButton } from '../helpers'

const LoginForm = ({ initialValues, validationSchema, onSubmit }) => {
  const classes = styles()
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isValid, isSubmitting, isValidating }) => (
        <Form className={classes.form}>
          <Field
            name='usuario'
            component={TextField}
            variant='outlined'
            margin='normal'
            fullWidth
            label='Usuário'
          />
          <Field
            type='password' name='senha'
            component={TextField}
            variant='outlined'
            margin='normal'
            fullWidth
            label='Senha'
          />
          <SubmitButton
            type='submit' disabled={isValidating || !isValid} submitting={isSubmitting}
            fullWidth
            variant='contained'
            color='primary'
            className={classes.submit}
          >
            Entrar
          </SubmitButton>
        </Form>
      )}
    </Formik>
  )
}

export default LoginForm