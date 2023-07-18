import * as React from 'react'
import { Container, Box } from '@mui/material';
import Page from '../components/Page';
import StackedBar from '../components/StackedBar';
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";

export default function SubphaseSituation() {

    const {
        getSubphasesSituation,
        getAuthorization
    } = useAPI()

    const navigate = useNavigate();

    const [dataset, setDataset] = React.useState([]);

    const loadDataset = async () => {
        const res = await getSubphasesSituation()
        let data = {}
        res.dados.forEach(element => {
            if (!Object.keys(data).includes(element.bloco)) {
                data[element.bloco] = {
                    dataPointA: [],
                    dataPointB: []
                }
            }
            data[element.bloco].dataPointA.push({
                label: element.subfase,
                y: +element.finalizadas
            })
            data[element.bloco].dataPointB.push({
                label: element.subfase,
                y: element.nao_finalizadas ? +element.nao_finalizadas : 0
            })
        });
        setDataset(
            Object.keys(data).map(k => {
                return {
                    title: k,
                    dataPointA: data[k].dataPointA,
                    dataPointB: data[k].dataPointB

                }
            })
        )
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
            <Container>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    {
                        dataset.map((item, idx) => {
                            return (
                                <StackedBar
                                    key={idx}
                                    {...item}
                                />
                            )
                        })
                    }
                </Box>
            </Container>
        </Page>
    );
}