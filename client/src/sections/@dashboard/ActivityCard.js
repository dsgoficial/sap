import React, { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import {
    Typography,
    CardActions,
    CardContent,
    Card,
    ButtonGroup,
    Button,
    Box,
    Alert,
    Collapse,
    IconButton
} from '@mui/material';
import StartActivityForm from './StartActivityForm'
import ReportErrorForm from './ReportErrorForm'
import FinishActivityForm from './FinishActivityForm'
import Loading from '../../components/Loading'
import { useAPI } from '../../contexts/apiContext'

export default function ActivityCard() {

    const { getData, postData } = useAPI()
    const [subtitle, setSubtitle] = useState('')
    const [message, setMessage] = useState({ severity: 'info', text: '' })
    const [activityByQgis, setActivityByQgis] = useState(false)
    const [showStartActivity, setShowStartActivity] = useState(false)
    const [activityId, setActivityId] = useState(null)
    const [showFinishActivity, setShowFinishActivity] = useState(false)
    const [showReportError, setShowReportError] = useState(false)
    const [wait, setWait] = useState(true)

    useEffect(() => {
        loadCurrentActivity()
    }, []);

    const loadCurrentActivity = async () => {
        setActivityId(null)
        let data = await getData('/api/distribuicao/verifica')
        if (data.dados == null) {
            setSubtitle(data.message)
            setWait(false)
            return
        }
        setSubtitle(data.dados.atividade.nome)
        setActivityByQgis(data.dados.atividade.dado_producao.tipo_dado_producao_id !== 1)
        setActivityId(data.dados.atividade.id)
        setWait(false)
    }

    const startActivity = async () => {
        setWait(true)
        try {
            let response = await postData(
                '/api/distribuicao/inicia',
                {}
            )
            showMessage(response.data.message, 'success')
            await loadCurrentActivity()
        } catch (error) {
            showMessage(error.response.data.message, 'error')
        }
        setWait(false)
    }

    const finishActivity = async () => {
        setWait(true)
        try {
            let response = await postData(
                '/api/distribuicao/finaliza',
                {
                    'atividade_id': activityId,
                    'sem_correcao': false,
                }
            )
            console.log(response)
            showMessage(response.data.message, 'success')
            await loadCurrentActivity()
        } catch (error) {
            console.log(error)
            showMessage(error.response.data.message, 'error')
        }
        setWait(false)
    }

    const reportError = async (errorInfo) => {
        setWait(true)
        try {
            let response = await postData(
                '/api/distribuicao/problema_atividade',
                {
                    'atividade_id': activityId,
                    ...errorInfo
                }
            )
            showMessage(response.data.message, 'success')
            await loadCurrentActivity()
        } catch (error) {
            showMessage(error.response.data.message, 'error')
        }
        setWait(false)
    }

    const showMessage = (text, severity) => {
        setMessage({ text, severity })
        setTimeout(() => {
            setMessage({ text: '' })
        }, 1000 * 10)
    }

    return (
        <>
            <Loading open={wait} />
            <Card>
                <CardContent>
                    <Typography align={'center'} variant='h6'>{subtitle}</Typography>
                </CardContent>
                <CardActions sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    p: 1,
                    m: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                }}>
                    <div style={{ width: '100%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                p: 1,
                                m: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                {
                                    !wait && !activityId &&
                                    <ButtonGroup variant="outlined">
                                        <Button
                                            onClick={() => setShowStartActivity(true)}
                                        >Iniciar Atividade</Button>
                                    </ButtonGroup>
                                }
                                {
                                    activityByQgis &&
                                    <Alert
                                        severity="warning"
                                        sx={{ width: '100%' }}
                                    >
                                        Use o QGIS para acessar atividade!
                                    </Alert>
                                }
                                {
                                    activityId && !activityByQgis &&
                                    <ButtonGroup variant="outlined">
                                        <Button
                                            onClick={() => setShowReportError(true)}
                                        >Reportar Problema</Button>
                                        <Button
                                            onClick={() => setShowFinishActivity(true)}
                                        >Finalizar</Button>
                                    </ButtonGroup>
                                }
                            </Box>
                            <Box sx={{ paddingTop: 5 }}>
                                <Collapse in={!!message.text}>
                                    <Alert
                                        variant="filled"
                                        severity={message.severity}
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={() => {
                                                    setMessage('');
                                                }}
                                            >
                                                <CloseIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                        sx={{ mb: 2 }}
                                    >
                                        {message.text}
                                    </Alert>
                                </Collapse>
                            </Box>
                        </Box>
                    </div>
                </CardActions>
            </Card>
            <StartActivityForm
                open={showStartActivity}
                setOpen={setShowStartActivity}
                onSubmit={() => startActivity()}
            />
            <ReportErrorForm
                open={showReportError}
                setOpen={setShowReportError}
                onSubmit={(data) => reportError(data)}
            />
            <FinishActivityForm
                open={showFinishActivity}
                setOpen={setShowFinishActivity}
                onSubmit={() => finishActivity()}
            />
        </>
    );
}