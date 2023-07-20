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
        getPIT,
        getAuthorization
    } = useAPI()

    const navigate = useNavigate();

    const [dataset, setDataset] = React.useState([]);
    const [loaded, setLoaded] = React.useState(true);

    const loadDataset = async () => {
        let curreMonthIdx = (new Date()).getMonth()
        const res = await getPIT()
        let data = {}
        res.dados.forEach((element) => {
            if (!Object.keys(data).includes(element.projeto)) {
                data[element.projeto] = {}
            }
            if (!Object.keys(data[element.projeto]).includes(element.lote)) {
                data[element.projeto][element.lote] = months.map((month, idx) => {
                    let amount = element.month == (idx + 1) ? element.finalizadas : '-'
                    return {
                        month: month.id,
                        count: amount,
                        meta: element?.meta
                    }
                })
                return
            }
            data[element.projeto][element.lote][element.month - 1].count = element?.finalizadas
        })
        
        setDataset(
            Object.keys(data).map(k => {
                return {
                    project: k,
                    rows: Object.keys(data[k]).map(s => {
                        let meta = data[k][s][0]?.meta ? data[k][s][0].meta : 0
                        let row = {
                            lot: s,
                            meta
                        }
                        let count = 0
                        data[k][s].forEach(m => {
                            row[m.month] = m.count
                            count += m.count == '-' ? 0 : +m.count
                        })
                        row.count = count
                        row.percent = `${(meta == 0 ? 0 : (count / meta * 100)).toFixed(2)}%`
                        return row
                    }),

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
                                        title={item.project}
                                        loaded={loaded}
                                        columns={[
                                            { title: 'Lote', field: 'lot' },
                                            { title: 'Meta', field: 'meta', maxWidth: '40px' },
                                            ...months.map(m => {
                                                return {
                                                    title: m.label,
                                                    field: m.id,
                                                    maxWidth: '10px'
                                                }
                                            }),
                                            { title: 'Quantitativo', field: 'count', maxWidth: '80px' },
                                            { title: '(%)', field: 'percent', maxWidth: '60px' }
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