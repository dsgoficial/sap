import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const StackedBar100Chart = ({ title, data }) => {

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
            data: data
        })
    }, [data])

    return (
        <CanvasJSChart options={options} />
    );
}

export default StackedBar100Chart
