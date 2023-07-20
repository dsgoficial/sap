import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const PieChart = ({ title, dataPoints }) => {

    const [options, setOptions] = React.useState({})

    React.useEffect(() => {
        setOptions({
           /*  animationEnabled: true,
            exportEnabled: true, */
            //theme: "dark2", // "light1", "dark1", "dark2"
            title: {
                text: title
            },
            data: [{
                type: "pie",
                indexLabel: "{label}: {y}%",
                startAngle: -90,
                dataPoints: dataPoints
            }]
        })
    }, [dataPoints])

    return (
        <CanvasJSChart 
            options={options} />
    );
}

export default PieChart
