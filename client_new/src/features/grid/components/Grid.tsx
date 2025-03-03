// Path: features\grid\components\Grid.tsx
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { select } from 'd3';
import { styled } from '@mui/material/styles';
import { Typography, Paper } from '@mui/material';
import { GridItem, GridData } from '@/types/grid';

// Styled components
const GridContainer = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

const GridTooltip = styled('div')({
  position: 'absolute',
  background: 'white',
  padding: '5px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  pointerEvents: 'none',
  opacity: 0,
  zIndex: 100,
});

interface GridProps {
  id: string;
  data: GridData;
  onItemHover: (item: GridItem | null) => void;
  width?: number;
  height?: number;
}

export const Grid = ({
  id: _id, // Renamed to _id to indicate it's not used
  data,
  onItemHover,
  width = 11,
  height = 11,
}: GridProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate grid size - memoized to prevent recalculation
  const { rowSize, colSize } = useMemo(() => {
    if (!data.grade || data.grade.length === 0)
      return { rowSize: 0, colSize: 0 };

    const rowSize = Math.max(...data.grade.map(item => item.i));
    const colSize = Math.max(...data.grade.map(item => item.j));

    return { rowSize, colSize };
  }, [data.grade]);

  // Memoize handlers to prevent recreation on each render
  const handlers = useMemo(() => {
    return {
      mouseOver: (d: GridItem) => {
        if (!d?.visited) return;

        // Update current item
        onItemHover(d);

        // Show tooltip
        if (tooltipRef.current) {
          select(tooltipRef.current).style('opacity', 1);
        }
      },
      mouseMove: (event: MouseEvent) => {
        if (tooltipRef.current) {
          select(tooltipRef.current)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        }
      },
      mouseOut: () => {
        onItemHover(null);

        // Hide tooltip
        if (tooltipRef.current) {
          select(tooltipRef.current).style('opacity', 0);
        }
      },
    };
  }, [onItemHover]);

  // Memoize cell style
  const cellStyles = useMemo(
    () => ({
      visited: '#AAC8A7',
      default: '#fff',
      stroke: '#222',
    }),
    [],
  );

  // Create matrix data - memoized to prevent recalculation on each render
  const createGridData = useCallback(() => {
    if (rowSize === 0 || colSize === 0) return [];

    const matrix: (GridItem & {
      x: number;
      y: number;
      width: number;
      height: number;
    })[][] = Array(rowSize)
      .fill(undefined)
      .map(() => Array(colSize).fill(undefined));

    data.grade.forEach(item => {
      if (item.i > 0 && item.j > 0 && item.i <= rowSize && item.j <= colSize) {
        matrix[item.i - 1][item.j - 1] = {
          x: (item.j - 1) * width,
          y: (item.i - 1) * height,
          width,
          height,
          ...item,
        };
      }
    });

    return matrix;
  }, [data.grade, rowSize, colSize, width, height]);

  // D3 code for grid visualization
  useEffect(() => {
    if (!svgRef.current || rowSize === 0 || colSize === 0) return;

    // Clear previous content
    select(svgRef.current).selectAll('*').remove();

    const gridData = createGridData();

    // Create SVG
    const svg = select(svgRef.current)
      .attr('width', colSize * width + 1)
      .attr('height', rowSize * height + 1);

    // Create rows
    const row = svg
      .selectAll('.row')
      .data(gridData)
      .enter()
      .append('g')
      .attr('class', 'row');

    // Create cells
    row
      .selectAll('.square')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('class', 'square')
      .style('fill', d =>
        d?.visited ? cellStyles.visited : cellStyles.default,
      )
      .attr('x', d => d?.x || 0)
      .attr('y', d => d?.y || 0)
      .attr('width', width)
      .attr('height', height)
      .style('stroke', cellStyles.stroke)
      .on('mouseover', function (event, d) {
        handlers.mouseOver(d);
        handlers.mouseMove(event as MouseEvent);
      })
      .on('mousemove', function (event) {
        handlers.mouseMove(event as MouseEvent);
      })
      .on('mouseout', handlers.mouseOut);
  }, [
    data.grade,
    width,
    height,
    rowSize,
    colSize,
    handlers,
    cellStyles,
    createGridData,
  ]);

  // Calculate progress percentage - memoized
  const progressPercentage = useMemo(() => {
    if (!data.grade || data.grade.length === 0) return '0';

    return (
      (data.grade.filter(item => item.visited).length / data.grade.length) *
      100
    ).toFixed(2);
  }, [data.grade]);

  return (
    <Paper elevation={1} sx={{ p: 2, height: '300px', width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        {`${data.projeto || ''} - ${data.lote || ''}`}
      </Typography>

      <Typography variant="body2" align="center">
        {`Progresso: ${progressPercentage}%`}
      </Typography>

      <GridContainer>
        <svg ref={svgRef} />

        <GridTooltip ref={tooltipRef}>
          {/* Tooltip content will be dynamically updated */}
        </GridTooltip>
      </GridContainer>

      {data.usuario && (
        <Typography variant="body2" align="center">
          Usuário: {data.usuario}
        </Typography>
      )}
    </Paper>
  );
};
