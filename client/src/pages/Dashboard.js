import * as React from 'react'
import {
    Container,
    Box,
    Grid,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";
import Page from '../components/Page';
import LinearProgress from '@mui/material/LinearProgress';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import StackedBar100Chart from '../components/StackedBar100Chart';
import PaperStyled from '../components/Paper';

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

function LinearProgressWithLabel(props) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} sx={{
                    height: '30px'
                }} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}


export default function Dashboard() {

    const {
        getAuthorization,
        getDashboard
    } = useAPI()

    const navigate = useNavigate();

    const [totalProducts, setTotalProducts] = React.useState(0);
    const [completedProducts, setCompletedProducts] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const [runningProducts, setRunningProducts] = React.useState(0);
    const [pieDataPoints, setPieDataPoints] = React.useState([]);
    const [pitDataset, setPitDataset] = React.useState([]);
    const [lotDataset, setLotDataset] = React.useState([]);
    const [noData, setNoData] = React.useState(false);

    const loadDataset = async () => {
        const response = await getDashboard()
        if (
            response[0].dados.length == 0
        ) {
            setNoData(true)
            return
        }
        setTotalProducts(response[0].dados.map(i => +i.quantidade).reduce((a, c) => {
            return +a + +c
        }))
        setCompletedProducts(response[1].dados.map(i => +i.finalizadas).reduce((a, c) => {
            return +a + +c
        }))
        setRunningProducts(response[2].dados.map(i => +i.count).reduce((a, c) => {
            return +a + +c
        }))

        loadPITDataset(response[3])
        loadLotDataset(
            response[0],
            response[1],
            response[2]
        )

    }

    const loadPITDataset = (response) => {
        let curreMonthIdx = (new Date()).getMonth()
        let data = {}
        response.dados.forEach(element => {
            if (!Object.keys(data).includes(element.projeto)) {
                data[element.projeto] = {}
            }
            if (!Object.keys(data[element.projeto]).includes(element.lote)) {
                data[element.projeto][element.lote] = months.map((month, idx) => {
                    return {
                        month: month.id,
                        count: element.month == (idx + 1) ? element.finalizadas : 0,
                        meta: element?.meta
                    }
                })
                return
            }
            data[element.projeto][element.lote][element.month].count = element?.finalizadas
        });
        setPitDataset(
            Object.keys(data).map(k => {
                return [...Object.keys(data[k]).map(s => {
                    let row = {
                        lot: s,
                        dataPoints: data[k][s].map(m => {
                            return {
                                y: +m.count,
                                label: m.month
                            }
                        })
                    }
                    return row
                })]
            }).flat().map(item => {
                return {
                    type: "stackedColumn",
                    name: item.lot,
                    showInLegend: true,
                    yValueFormatString: "#,###",
                    dataPoints: item.dataPoints
                }
            })
        )
    }

    const loadLotDataset = (
        responseAmount,
        responseCompleted,
        responseRunning
    ) => {
        let data = {}
        let dataPointsRunning = []
        let dataPointsNotStarted = []
        let dataPointsCompleted = []

        responseAmount.dados
            .sort((a, b) => {
                return a.lot_id - b.lot_id;
            })
            .forEach(item => {
                let itemFinalized = responseCompleted.dados.find(i => i.lote == item.lote)
                let itemRunning = responseRunning.dados.find(i => i.lote == item.lote)
                let amount = item?.quantidade ? +item?.quantidade : 0
                let completed = itemFinalized?.finalizadas ? +itemFinalized?.finalizadas : 0
                let running = itemRunning?.count ? +itemRunning?.count : 0
                dataPointsRunning.push({
                    label: item.lote,
                    y: running
                })
                dataPointsNotStarted.push({
                    label: item.lote,
                    y: amount - (running + completed)
                })
                dataPointsCompleted.push({
                    label: item.lote,
                    y: completed
                })
            })

        setLotDataset(
            [
                {
                    type: "stackedBar100",
                    color: "#7A9D54",
                    name: "Concluído",
                    showInLegend: true,
                    indexLabel: "{y}",
                    indexLabelFontColor: "white",
                    yValueFormatString: "#,###",
                    dataPoints: dataPointsCompleted.reverse()
                },
                {
                    type: "stackedBar100",
                    color: "#4FC0D0",
                    name: "Em Execução",
                    showInLegend: true,
                    indexLabel: "{y}",
                    indexLabelFontColor: "white",
                    yValueFormatString: "#,###",
                    dataPoints: dataPointsRunning.reverse()
                },

                {
                    type: "stackedBar100",
                    color: "#F24C3D",
                    name: "Não iniciado",
                    showInLegend: true,
                    indexLabel: "{y}",
                    indexLabelFontColor: "white",
                    yValueFormatString: "#,###",
                    dataPoints: dataPointsNotStarted.reverse()
                }

            ]
        )
    }

    React.useEffect(() => {
        loadDataset()
    }, []);

    React.useEffect(() => {
        if (!(completedProducts / totalProducts)) return
        setProgress(Number((completedProducts / totalProducts * 100).toFixed(2)))
    }, [
        totalProducts,
        completedProducts
    ]);

    React.useEffect(() => {
        setPieDataPoints([
            { y: completedProducts, label: "Finalizados" },
            { y: totalProducts - (completedProducts + runningProducts), label: "Não Iniciado" },
            { y: runningProducts, label: "Em Execução" }
        ])
    }, [
        totalProducts,
        completedProducts,
        runningProducts
    ]);

    if (getAuthorization() != 'ADMIN') {
        navigate('/login')
        return null
    }

    if (noData) {
        return (
            <Page title="Sistema de Apoio à Produção">
                <Container
                    maxWidth={'100%'}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography
                            sx={{
                                flexGrow: 1,
                                fontSize: '30px',
                                color: 'black'
                            }}
                        >
                            {'PIT não cadastrado'}
                        </Typography>
                    </Box>
                </Container>
            </Page>
        )
    }



    return (
        <Page title="Sistema de Apoio à Produção">
            <Container
                maxWidth={'100%'}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={4} md={4}>
                            <PaperStyled
                                sx={{
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography
                                    sx={{
                                        flexGrow: 1,
                                        fontSize: '30px',
                                        color: 'black'
                                    }}
                                >
                                    {'Total de Produtos'}
                                </Typography>
                                <Typography
                                    sx={{
                                        flexGrow: 1,
                                        fontSize: '40px'
                                    }}
                                >
                                    {totalProducts}
                                </Typography>
                            </PaperStyled>
                        </Grid>
                        <Grid item xs={4} md={4}>
                            <PaperStyled
                                sx={{
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography
                                    sx={{
                                        flexGrow: 1,
                                        fontSize: '30px',
                                        color: 'black'
                                    }}
                                >
                                    {'Porcentagem Concluída'}
                                </Typography>
                                <Box sx={{ flexGrow: 1, width: '100%' }}>
                                    <LinearProgressWithLabel value={progress} />
                                </Box>
                            </PaperStyled>
                        </Grid>
                        <Grid item xs={4} md={4}>
                            <PaperStyled
                                sx={{
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography
                                    sx={{
                                        flexGrow: 1,
                                        fontSize: '30px',
                                        color: 'black'
                                    }}
                                >
                                    {'Produtos Concluídos'}
                                </Typography>
                                <Typography
                                    sx={{
                                        flexGrow: 1,
                                        fontSize: '40px'
                                    }}
                                >
                                    {completedProducts}
                                </Typography>
                            </PaperStyled>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={6}>
                            <PaperStyled
                                sx={{
                                    height: '100%'
                                }}
                            >
                                <PieChart {...{ title: 'Produtos', dataPoints: pieDataPoints }} />
                            </PaperStyled>
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <PaperStyled
                                sx={{
                                    height: '100%',
                                    width: '100%'
                                }}
                            >
                                <BarChart {...{
                                    title: 'Produtos Por Mês',
                                    yTitle: 'Produtos',
                                    data: pitDataset
                                }} />
                            </PaperStyled>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12}>
                            <PaperStyled
                                sx={{
                                    height: '100%',
                                    width: '100%'
                                }}
                            >
                                <StackedBar100Chart
                                    {...{
                                        title: 'Atividades Por Lote',
                                        data: lotDataset
                                    }}
                                />
                            </PaperStyled>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Page>
    );
}