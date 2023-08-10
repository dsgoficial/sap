import * as React from 'react'
import { Container, Box } from '@mui/material';
import Page from '../components/Page';
import MaterialTable from '../components/Table';
import { useAPI } from '../contexts/apiContext'
import { useNavigate } from "react-router-dom";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

export default function Maps() {

    const {
        getViews,
        getAuthorization,
        getLotGEOJSON
    } = useAPI()

    const navigate = useNavigate();

    const [map, setMap] = React.useState(null);
    const [layers, setLayers] = React.useState(null);

    const [layersVisible, setLayersVisible] = React.useState({});

    const loadDataset = async () => {

        const res = await getViews()
        const names = res.dados.views
            .filter(item => item.tipo == 'lote')
            .map(item => item.nome)

        const resLayers = await Promise.all(
            names
                .map(name => getLotGEOJSON(name))
        )
        const layers = resLayers.map(item => item.dados[0].geojson)

        let data = {}
        names.forEach((name, i) => {
            if (!layers[i].features) return
            data[name] = layers[i]
        })
        setLayers(data)
    }

    const loadGEOJSON = (name, geojson) => {
        map.on('load', () => {
            map.addSource(name, {
                'type': 'geojson',
                'data': geojson
            });
            map.addLayer({
                'id': `${name}-fill`,
                'type': 'fill',
                'source': `${name}`,
                'paint': {
                    'fill-color': getFillColorRules(geojson),
                    'fill-opacity': 0.8
                }
            });
            map.addLayer({
                'id': `${name}-pattern`,
                'type': 'fill',
                'source': `${name}`,
                'paint': {
                    'fill-pattern': getPatternRules(geojson)
                }
            })
            map.addLayer({
                'id': `${name}-border`,
                'type': 'line',
                'source': `${name}`,
                'paint': {
                    'line-color': '#050505',
                    'line-width': 0.5
                }
            })
        });
    }

    const getFillColorRules = (geojson) => {
        if (geojson) {
            let fields = Object.keys(geojson.features[0].properties).filter(k => k.split('_')[0] == 'f')
            fields.sort((a, b) => +a.split('_')[1] - +b.split('_')[1])
            fields = fields.map(name => name.split('_').slice(0, -2).join('_'))
            let rules = [
                'case'
            ]
            fields.forEach((field, idx) => {
                let keys = [...Array(idx).keys()].map(i => fields[i])
                let cases = [
                    ...[...new Set(keys)].map(f => (keys.lastIndexOf(f) + 1) > 1 && !(f == field) ? getIsNotNullRule(`${f}_data_fim`) : getIsNullRule(`${f}_data_fim`)),


                    (keys.lastIndexOf(field) + 1) % 2 != 0 ? getIsNotNullRule(`${field}_data_inicio`) : getIsNullRule(`${field}_data_inicio`)
                ]
                cases.length == 1 ? cases.unshift('any') : cases.unshift('all')
                rules.push(cases)
                rules.push(getRuleColorByField(field.split('_')[2]))
            })
            rules.push([
                'all',
                ...[...new Set(fields)].map(field => getIsNotNullRule(`${field}_data_fim`)),
                true
            ])
            rules.push(getRuleColorByField('concluido'))
            rules.push('#607d8b')
            return rules
        } else {
            return ''
        }
    }

    const getPatternRules = (geojson) => {
        if (geojson) {
            let fields = Object.keys(geojson.features[0].properties).filter(k => k.split('_')[0] == 'f')
            fields.sort((a, b) => +a.split('_')[1] - +b.split('_')[1])
            fields = fields.map(name => name.split('_').slice(0, -2).join('_'))
            let rules = [
                'case'
            ]
            fields.forEach((field, idx) => {
                let keys = [...Array(idx).keys()].map(i => fields[i])
                let cases = [
                    ...[...new Set(keys)].map(f => (keys.lastIndexOf(f) + 1) > 1 && !(f == field) ? getIsNotNullRule(`${f}_data_fim`) : getIsNullRule(`${f}_data_fim`)),


                    (keys.lastIndexOf(field) + 1) % 2 != 0 ? getIsNotNullRule(`${field}_data_inicio`) : getIsNullRule(`${field}_data_inicio`)
                ]
                cases.length == 1 ? cases.unshift('any') : cases.unshift('all')
                rules.push(cases)
                rules.push((keys.lastIndexOf(field) + 1) % 2 != 0 ? 'pattern' : '')
            })
            rules.push([
                'all',
                ...[...new Set(fields)].map(field => getIsNotNullRule(`${field}_data_fim`)),
                true
            ])
            rules.push('')
            rules.push('')
            return rules
        } else {
            return ''
        }
    }

    const getRuleColorByField = (field) => {
        return {
            'preparo': 'rgb(175,141,195)',
            'extracao': 'rgb(252,141,89)',
            'validacao': 'rgb(255,255,191)',
            'disseminacao': 'rgb(145,207,96)',
            'concluido': 'rgb(175,141,195)'
        }[field]
    }

    const getIsNullRule = (field) => {
        return ['any', ['==', ['get', field], null], ['==', ['get', field], ""]]
    }

    const getIsNotNullRule = (field) => {
        return ['all', ['!=', ['get', field], null], ['!=', ['get', field], ""]]
    }

    const getButtonLayers = () => {
        return (
            <Box sx={{ width: '90%', bgcolor: 'background.paper' }}>
                <List>
                    {
                        layers &&
                        Object.keys(layers)
                            .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]))
                            .map((name, k) => {
                                return (
                                    <ListItem
                                        disablePadding
                                        key={k}

                                        dense
                                    >
                                        <ListItemButton
                                            onClick={() => {
                                                selectLayer(name)
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={!!layersVisible?.[name]}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText primary={name} />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })
                    }
                </List>
            </Box>
        );
    }

    const selectLayer = (clickedLayer) => {
        const visible = !layersVisible[clickedLayer]
        setLayersVisible({
            ...layersVisible,
            [clickedLayer]: visible
        })
        for (let layer of [
            `${clickedLayer}-fill`,
            `${clickedLayer}-pattern`,
            `${clickedLayer}-border`
        ]) {
            if (!map.getLayer(layer)) {
                continue
            }
            if (visible) {
                map.setLayoutProperty(
                    layer,
                    'visibility',
                    'visible'
                )
            } else {
                map.setLayoutProperty(layer, 'visibility', 'none')
            }
        }

    };

    React.useEffect(() => {
        loadDataset()
    }, []);

    React.useEffect(() => {
        var map = new window.maplibregl.Map({
            container: 'map',
            style:
                'https://api.maptiler.com/maps/streets/style.json?key=tLpO7P2cZG0MPIqHCFYJ',
            center: [-53.050133640018544, -26.652845315797606],
            zoom: 5

        });
        setMap(map)
        map.loadImage(
            `${process.env.PUBLIC_URL}/hachura.png`,
            (err, image) => {
                // Throw an error if something went wrong
                if (err) throw err;

                // Declare the image
                map.addImage('pattern', image);

            }
        );
        /*   map.on('mouseup', () => {
              console.log(map.getZoom())
              let bounds = map.getBounds()
              console.log([
                  [bounds._sw.lng, bounds._sw.lat],
                  [bounds._ne.lng, bounds._ne.lat]
              ])
              console.log(map.getCenter())
          }) */
    }, []);

    React.useEffect(() => {
        if (!(map && layers)) return
        Object.keys(layers).forEach(name => {
            if (map.getLayer(name)) {
                return
            }
            loadGEOJSON(name, layers[name])
        })
        let visible = {}
        Object.keys(layers).forEach(name => visible[name] = true)
        setLayersVisible(visible)

    }, [map, layers]);

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
                        width: '100%'
                    }}
                >
                    <Box
                        sx={{
                            width: '80%'
                        }}
                    >
                        <div
                            style={{ height: '80vh' }}
                            id="map">

                        </div>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            width: '20%'
                        }}
                    >
                        {getButtonLayers()}
                    </Box>
                </Box>
            </Container>
        </Page>
    );
}