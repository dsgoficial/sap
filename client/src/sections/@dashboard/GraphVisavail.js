import React from 'react'
import * as visavail from "../../vendors/visavail/visavail.js";
import "../../vendors/visavail/visavail.min.css";
import { Box } from '@mui/material';

const GraphVisavail = (props) => {
  const [options, setOptions] = React.useState(null);
  const [dataset, setDataset] = React.useState(null);

  React.useEffect(() => {
    setOptions({
      ...props.options,
      width: document.getElementById(props.idBar).offsetWidth,
      zoom: {
        enabled: true
      },
      graph: {
        type: "bar",
        width: 20,
        height: 20
      },
      sub_chart: {
        enabled: true,
        height: 90,
        graph: { enabled: "" }
      }
    })
    setDataset(props.dataset)
  }, [props.options, props.dataset]);

  React.useEffect(() => {
    if (!(options && dataset)) return
    visavail.generate(options, dataset)
  }, [options, dataset]);

  return (
    <Box>
      <div
        style={{ width: '100%'}}
        className="visavail"
        id={props.idContainer}/* "alarm_bar_container" */
      >
        <div id={props.idBar}/* "alarm_bar_div" */ style={{ width: '100%' }}>
        </div>
      </div>
    </Box>

  )
}

export default GraphVisavail
