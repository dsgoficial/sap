import * as React from 'react'
import { Container, Box } from '@mui/material';
import Page from '../components/Page';
import { GraphVisavail } from '../sections/@dashboard'
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";

export default function UserAcitivities() {

    const {
        getUserActivities,
        getAuthorization
    } = useAPI()

    const navigate = useNavigate();

    const [graphs, setGraphs] = React.useState([]);

    const loadGraphs = async () => {
        const res = await getUserActivities()
        let graphs = [
            {
                idContainer: `user_bar_container-0`,
                idBar: `user_bar_div-0`,
                options: {
                    title: {
                        text: `Atividades`
                    },
                    id_div_container: `user_bar_container-0`,
                    id_div_graph: `user_bar_div-0`,
                    date_in_utc: false,
                    line_spacing: 24,
                    tooltip: {
                        height: 18,
                        position: "overlay",
                        left_spacing: 20,
                        only_first_date: true,
                        date_plus_time: true
                    },
                    responsive: {
                        enabled: true
                    }
                },
                dataset: res.dados.map(item => {
                    return {
                        measure: item.usuario,
                        data: item.data
                    }
                })
            }
        ]
        setGraphs(graphs)
    }

    React.useEffect(() => {
        loadGraphs()
    }, []);

    if (getAuthorization() != 'ADMIN') {
        navigate('/login')
        return null
    }


    return (
        <Page title="Sistema de Apoio à Produção">
            <Container>
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        padding: '20px',
                        height: '100%',
                        width: '100%',
                        borderRadius: '8px'
                    }}
                >
                    {
                        graphs.map((graph, idx) => {
                            return (
                                <GraphVisavail
                                    key={idx}
                                    {...{
                                        ...graph
                                    }}
                                />
                            )
                        })
                    }
                </Box>
            </Container>
        </Page>
    );
}