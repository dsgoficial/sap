import React, { useState } from 'react'
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { Typography, Container, Avatar, Paper } from '@mui/material';
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import * as Yup from 'yup'
import { Navigate } from 'react-router-dom'
import Page from '../components/Page';
import SubmitButton from '../components/SubmitButton'
import { useSnackbar } from 'notistack';
import BackgroundImages from '../components/BackgroundImages'
import { useAPI } from '../contexts/apiContext'
import { styled } from '@mui/system';

const validationSchema = Yup.object().shape({
    usuario: Yup.string()
        .required('Preencha seu usuário'),
    senha: Yup.string()
        .required('Preencha sua senha')
})

const DivStyled = styled('div')(({ theme }) => ({
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
}));

const PaperStyled = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3, 2),
    elevation: 3
}));

const FormStyled = styled(Form)(({ theme }) => ({
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
}));

const SubmitButtonStyled = styled(SubmitButton)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2)
}));

export default function Login() {
    const {
        login,
        history,
        isAuthenticated
    } = useAPI()

    const { enqueueSnackbar } = useSnackbar();

    const values = { usuario: '', senha: '' }

    const onSubmit = async (values) => {
        try {
            const success = await login(values.usuario, values.senha)
            if (success) history.go('/')
        } catch (error) {
            showSnackbar(error.msg, 'warning')
        }
    }

    const showSnackbar = (message, variant) => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, { variant });
    };

    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    return (
        <Page title="Sistema de Apoio à Produção">
            <BackgroundImages>
                <DivStyled>
                    <Container component='main' maxWidth='xs'>
                        <PaperStyled>
                            <Avatar sx={{
                                bgcolor: '#F50057'
                            }}>
                                <AutoGraphIcon />
                            </Avatar>
                            <Typography component='h1' variant='h5'>
                                Sistema de Apoio à Produção
                            </Typography>
                            <Formik
                                initialValues={values}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                            >
                                {({ isValid, isSubmitting, isValidating }) => (
                                    <FormStyled>
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
                                        <SubmitButtonStyled
                                            type='submit' disabled={isValidating || !isValid} submitting={isSubmitting}
                                            fullWidth
                                            variant='contained'
                                            color='primary'
                                        >
                                            Entrar
                                        </SubmitButtonStyled>
                                    </FormStyled>
                                )}
                            </Formik>
                        </PaperStyled>
                    </Container>
                </DivStyled>
            </BackgroundImages>
        </Page>
    );
}