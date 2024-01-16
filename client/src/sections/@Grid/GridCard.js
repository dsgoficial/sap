import React from 'react'
import Grid from '../../components/Grid';
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

export default function GridCard({ id, grid }) {

    const [currentMouseover, setCurrentMouseover] = React.useState(null)

    var countTotal = grid.grade.length
    var countVisited = grid.grade.filter(item => item.visited).length

    return (

        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                padding: '5px'
            }}
        >
            <CardContent
                sx={{
                    width: '100%',
                    padding: '0px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '1px'
                }}
            >
                {
                    countTotal > 0 &&
                    <Typography>
                        {`${((countVisited / countTotal) * 100).toFixed(2)}%`}
                    </Typography>
                }

                <Typography>
                    {currentMouseover && currentMouseover.data_atualizacao}
                </Typography>

            </CardContent>
            <CardContent
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: '0px',
                    width: '250px',
                    height: '250px'
                }}
            >
                {
                    countTotal > 0 &&
                    <Grid  {...{
                        id: id,
                        data: grid,
                        handleMouseover: (item) => {
                            setCurrentMouseover(item)
                        }
                    }} />
                }
            </CardContent>
            <CardContent
                sx={{
                    width: '100%',
                    padding: '0px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                {
                    [
                        grid.data_inicio,
                        grid.usuario,
                        `${grid.projeto}-${grid.lote}`,
                        `${grid.fase}-${grid.bloco}`,
                        `${grid.subfase}-${grid.etapa}`
                    ].map((label, idx) => {
                        return (
                            <Typography key={idx}
                                sx={{
                                    textAlign: 'center',
                                    inlineSize: '250px',
                                    overflowWrap: 'break-word'
                                }}
                            >
                                {label}
                            </Typography>
                        )
                    })
                }
            </CardContent>
        </Card >
    );
}