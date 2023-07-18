import * as React from 'react'
import { Container, Box } from '@mui/material';
import Page from '../components/Page';
import MaterialTable from '../components/Table';
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";

const months = [
    {
        label: 'Janeiro',
        id: 'jan'
    },
    {
        label: 'Fevereiro',
        id: 'fev'
    },
    {
        label: 'Março',
        id: 'mar'
    },
    {
        label: 'Abril',
        id: 'abr'
    },
    {
        label: 'Maio',
        id: 'mai'
    },
    {
        label: 'Junho',
        id: 'jun'
    },
    {
        label: 'Julho',
        id: 'jul'
    },
    {
        label: 'Agosto',
        id: 'ago'
    },
    {
        label: 'Setembro',
        id: 'set'
    },
    {
        label: 'Outubro',
        id: 'out'
    },
    {
        label: 'Novembro',
        id: 'nov'
    },
    {
        label: 'Dezembro',
        id: 'dez'
    }
]

export default function Dashboard() {

    const {
        getLots,
        getAuthorization
    } = useAPI()

    const navigate = useNavigate();

    const [dataset, setDataset] = React.useState([]);
    const [loaded, setLoaded] = React.useState(true);

    const loadDataset = async () => {
        const res = await getLots()
        let data = {}
        res.dados.forEach(element => {
            if (!Object.keys(data).includes(element.lote)) {
                data[element.lote] = {}
            }
            if (!Object.keys(data[element.lote]).includes(element.subfase)) {
                data[element.lote][element.subfase] = months.map((month, idx) => {
                    return {
                        month: month.id,
                        count: element.month == (idx + 1) ? element.count : 0
                    }
                })
                return
            }
            data[element.lote][element.subfase][element.month].count = element?.count ? element?.count : 0
        });
        setDataset(
            Object.keys(data).map(k => {
                return {
                    lot: k,
                    rows: Object.keys(data[k]).map(s => {
                        let row = {
                            subphase: s
                        }
                        data[k][s].forEach(m => {
                            row[m.month] = +m.count
                        })
                        return row
                    })
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
            <Container
                maxWidth={'100%'}
            >
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
                                <MaterialTable
                                    key={idx}
                                    title={item.lot}
                                    loaded={loaded}
                                    columns={[
                                        { title: 'Subfase', field: 'subphase' },
                                        ...months.map(m => {
                                            return {
                                                title: m.label,
                                                field: m.id
                                            }
                                        })
                                    ]}
                                    data={item.rows}
                                    actions={[]}
                                    options={{
                                        selection: false
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