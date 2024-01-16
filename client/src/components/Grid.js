import { useD3 } from '../hooks/useD3';
import React from 'react';
import * as d3 from 'd3';

import './css/style.css'

function Grid({ id, data, handleMouseover }) {

    var width = 11;
    var height = 11;
    var rowSize = data.grade.map(item => item.i).reduce((a, b) => Math.max(a, b), -Infinity);//i
    var columnSize = data.grade.map(item => item.j).reduce((a, b) => Math.max(a, b), -Infinity);//i//i

    const ref = useD3(
        (svg) => {


            function gridData(data) {
                var matrix = new Array(rowSize).fill().map(() => Array(columnSize).fill())

                data.grade.forEach((item, idx) => {
                    matrix[item.i - 1][item.j - 1] = {
                        x: (item.j - 1) * width,
                        y: (item.i - 1) * height,
                        width: width,
                        height: height,
                        ...item
                    }
                });
                return matrix;
            }

            var gridData = gridData(data)

            //d3.select(`.tooltip-grid-${id}`).remove()
            d3.select(`#grid-${id}`).html(null)

            /* var div = d3.select(`#grid-${id}`).append("div")
                .attr("class", `tooltip-donut tooltip-grid-${id}`)
                .style("opacity", 0) */


            var grid = d3.select(`#grid-${id}`)
                .append("svg")
                .attr("width", `${(columnSize * height) + 1}px`)
                .attr("height", `${(rowSize * width) + 1}px`);

            var row = grid.selectAll(".row")
                .data(gridData)
                .enter().append("g")
                .attr("class", "row");

            var column = row.selectAll(".square")
                .data(function (d) { return d; })
                .enter().append("rect")
                .attr("class", "square")
                .style("fill", function (d) {
                    return d?.visited ? "#AAC8A7" : "#fff";
                })
                .attr("x", function (d) { return d?.x; })
                .attr("y", function (d) { return d?.y; })
                .attr("width", function (d) { return width; })
                .attr("height", function (d) { return height; })
                .style("stroke", "#222")
                .on('mouseover', function (d, i) {
                    let item = d3.select(this).data()[0]
                    if (!item?.visited) return
                    handleMouseover(item)
                    //var pointer = d3.pointer(d);
                    /*  div.html(item.data_atualizacao)
                         .style("left", pointer[0] + 'px')
                         .style("top", pointer[1] + 'px')
                         .style('opacity', 1); */
                })
                .on('mouseout', function (d, i) {
                    handleMouseover(null)
                    /* div.html('')
                        .style('opacity', 0); */
                });

        },
        [data]
    );

    return (
        <div ref={ref} id={`grid-${id}`} style={{
        }}></div>
    );
}

export default Grid;