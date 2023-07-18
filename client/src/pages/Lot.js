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
                        dataset.map((item, idx) => {
                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        width: '90%'
                                    }}
                                >
                                    <MaterialTable
                                        title={item.lot}
                                        loaded={loaded}
                                        columns={[
                                            { title: 'Subfase', field: 'subphase' },
                                            ...months.map(m => {
                                                return {
                                                    title: m.label,
                                                    field: m.id,
                                                    maxWidth: '10px'
                                                }
                                            })
                                        ]}
                                        data={item.rows}
                                        actions={[]}
                                        options={{
                                            selection: false
                                        }}
                                    />
                                </Box>
                            )
                        })
                    }
                </Box>
            </Container>
        </Page>
    );
}