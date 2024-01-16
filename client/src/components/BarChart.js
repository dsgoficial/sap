import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const BarChart = ({ title, yTitle, data }) => {


    const [chart, setChart] = React.useState(null)
    const [options, setOptions] = React.useState({})


    const toggleDataSeries = (e) => {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }


    React.useEffect(() => {
        setOptions({
            animationEnabled: true,
            //exportEnabled: true,
            title: {
                text: title
            },
            axisY: {
                title: yTitle
            },
            toolTip: {
                shared: true,
                reversed: true
            },
            legend: {
                verticalAlign: "center",
                horizontalAlign: "right",
                reversed: true,
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: data
        })
    }, [data])

    return (
        <CanvasJSChart
            onRef={ref => setChart(ref)}
            options={options} />
    );
}

export default BarChart
