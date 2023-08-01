import * as React from 'react'
import { Container, Box } from '@mui/material';
import Page from '../components/Page';
import MaterialTable from '../components/Table';
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";

const months = [
    {
        label: 'Jan',
        id: 'jan'
    },
    {
        label: 'Fev',
        id: 'fev'
    },
    {
        label: 'Mar',
        id: 'mar'
    },
    {
        label: 'Abr',
        id: 'abr'
    },
    {
        label: 'Maio',
        id: 'mai'
    },
    {
        label: 'Jun',
        id: 'jun'
    },
    {
        label: 'Jul',
        id: 'jul'
    },
    {
        label: 'Ago',
        id: 'ago'
    },
    {
        label: 'Set',
        id: 'set'
    },
    {
        label: 'Out',
        id: 'out'
    },
    {
        label: 'Nov',
        id: 'nov'
    },
    {
        label: 'Dez',
        id: 'dez'
    }
]

export default function Dashboard() {

    const {
        getLots,
        getAuthorization,
        getRunningActivities,
        getLastCompletedActivities
    } = useAPI()

    const navigate = useNavigate();

    const [dataset, setDataset] = React.useState({});
    const [loaded, setLoaded] = React.useState(true);

    const loadDataset = async () => {
        const info = await Promise.all([
            getRunningActivities(),
            getLastCompletedActivities()
        ])
        setDataset({
            runningActivities: info[0].dados.map((item) => {
                let duracao = item.duracao
                return {
                    ...item,
                    duration: `Dias: ${duracao?.days ? duracao?.days : '-'}, Horas: ${duracao?.hours ? duracao?.hours : '-'}, Minutos: ${duracao?.minutes ? duracao?.minutes : '-'}, Segundos: ${duracao?.seconds ? duracao?.seconds : '-'}`
                }
            }),
            lastCompletedActivities: info[1].dados
        })
    }

    React.useEffect(() => {
        loadDataset()
    }, []);

    if (getAuthorization() != 'ADMIN') {
        navigate('/login')
        return null
    }


    return (
        <Page title="Sistema de Apoio à Produção">
            <Container
                maxWidth={'100%'}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 2
                    }}
                >
                    {
                        dataset?.runningActivities &&
                        <>
                            <MaterialTable
                                title={'Atividades em execução'}
                                loaded={loaded}
                                columns={[
                                    { title: 'Projeto', field: 'projeto_nome' },
                                    { title: 'Lote', field: 'lote' },
                                    { title: 'Fase', field: 'fase_nome' },
                                    { title: 'Subfase', field: 'subfase_nome' },
                                    { title: 'Etapa', field: 'etapa_nome' },
                                    { title: 'Bloco', field: 'bloco' },
                                    { title: 'Atividade ID', field: 'atividade_id' },
                                    { title: 'Usuário', field: 'usuario' },
                                    { title: 'Data Início', field: 'data_inicio' },
                                    { title: 'Data Fim', field: 'duration' },
                                ]}
                                data={dataset.runningActivities}
                                actions={[]}
                                options={{
                                    selection: false
                                }}
                            />

                        </>
                    }
                    {
                        dataset?.lastCompletedActivities &&
                        <>
                            <MaterialTable
                                title={'Últimas atividades finalizadas'}
                                loaded={loaded}
                                columns={[
                                    { title: 'Projeto', field: 'projeto_nome' },
                                    { title: 'Lote', field: 'lote' },
                                    { title: 'Fase', field: 'fase_nome' },
                                    { title: 'Subfase', field: 'subfase_nome' },
                                    { title: 'Etapa', field: 'etapa_nome' },
                                    { title: 'Bloco', field: 'bloco' },
                                    { title: 'Atividade ID', field: 'atividade_id' },
                                    { title: 'Usuário', field: 'usuario' },
                                    { title: 'Data Início', field: 'data_inicio' },
                                    { title: 'Data Fim', field: 'data_fim' },
                                ]}
                                data={dataset.lastCompletedActivities}
                                actions={[]}
                                options={{
                                    selection: false
                                }}
                            />

                        </>
                    }
                </Box>
            </Container>
        </Page>
    );
}