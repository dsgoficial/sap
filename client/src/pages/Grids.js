import { Container } from '@mui/material';
import Page from '../components/Page';
import { GridCard } from '../sections/@Grid'
import { useAPI } from '../contexts/apiContext'
import Loading from '../components/Loading'
import React from 'react'
import {
    Typography,
    CardHeader,
    CardContent,
    Card,
    ButtonGroup,
    Button,
    Box,
    Alert,
    IconButton
} from '@mui/material';

import { useNavigate } from "react-router-dom";

export default function Grid() {

    const {
        getStatisticsGrid,
        getAuthorization,
        history
    } = useAPI()

    const [wait, setWait] = React.useState(true)
    const [data, setData] = React.useState([])

    const navigate = useNavigate();

    const loadGrids = async () => {
        setWait(true)
        const data = await getStatisticsGrid()
        setData(data.dados.sort(function (a, b) {
            return new Date(b.data_inicio) - new Date(a.data_inicio);
        }))
        setWait(false)
    }

    React.useEffect(() => {
        loadGrids()
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    if (getAuthorization() != 'ADMIN') {
        navigate('/login')
        return null
    }

    return (
        <Page title="Sistema de Apoio à Produção">
            <Container
                maxWidth="xl"
            >
                <Loading style={wait ? {} : { display: 'none' }} />
                <Box
                    style={!wait ? {} : { display: 'none' }}
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 2,
                        width: '100%'
                    }}
                >
                    {
                        data.map((grid, idx) => {
                            return (
                                <GridCard key={idx} {...{ id: idx, grid }} />
                            )
                        })
                    }
                </Box>
            </Container>
        </Page>
    );
}