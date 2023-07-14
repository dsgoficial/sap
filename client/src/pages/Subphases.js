import * as React from 'react'
import { Container, Box } from '@mui/material';
import Page from '../components/Page';
import { GraphVisavail } from '../sections/@dashboard'
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

    const {
        getActivitySubphase,
        getAuthorization
    } = useAPI()

    const navigate = useNavigate();

    const [graphs, setGraphs] = React.useState([]);

    const loadGraphs = async () => {
        const res = await getActivitySubphase()
        let graphs = []
        let lastLotName = null
        let lastLot = null
        let count = 0
        for (let lot of res.dados) {
            if (!lastLot || lastLotName != lot.lote) {
                if (lastLot) graphs.push(lastLot)
                lastLotName = lot.lote
                count += 1
                let idContainer = `alarm_bar_container-${count}`
                let idBar = `alarm_bar_div-${count}`
                lastLot = {
                    idContainer,
                    idBar,
                    options: {
                        title: {
                            text: lot.lote
                        },
                        id_div_container: idContainer,
                        id_div_graph: idBar,
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
                    dataset: []
                }
            }
            lastLot.dataset.push({
                measure: lot.subfase,
                data: lot.data.map(item => {
                    return [item[0], +item[1], item[2]]
                })
            })
        }
        console.log(graphs[0])
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
            </Container>
        </Page>
    );
}