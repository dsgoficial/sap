import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const StackedBarSubphaseSituation = ({ title, dataPointA, dataPointB }) => {

    const [options, setOptions] = React.useState({})

    React.useEffect(() => {
        setOptions({
            title: {
                text: title
            },
            toolTip: {
                shared: true
            },
            legend: {
                verticalAlign: "top"
            },
            axisY: {
                suffix: "%"
            },
            data: [{
                type: "stackedBar100",
                color: "#9bbb59",
                name: "Finalizadas",
                showInLegend: true,
                indexLabel: "{y}",
                indexLabelFontColor: "white",
                yValueFormatString: "#,###",
                dataPoints: dataPointA
            },
            {
                type: "stackedBar100",
                color: "#7f7f7f",
                name: "Não Finalizadas",
                showInLegend: true,
                indexLabel: "{y}",
                indexLabelFontColor: "white",
                yValueFormatString: "#,###",
                dataPoints: dataPointB
            }]
        })
    }, [])

    return (
        <div>
            <CanvasJSChart options={options} />
        </div>
    );
}

export default StackedBarSubphaseSituation
