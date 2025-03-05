// Path: features\grid\components\Grid.tsx
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { select, drag } from 'd3';
import { styled } from '@mui/material/styles';
import { Box, useTheme, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
  overflow: 'hidden',
});

const GridTooltip = styled('div')(({ theme }) => ({
  position: 'fixed',
  background: theme.palette.background.paper,
  padding: '5px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  pointerEvents: 'none',
  opacity: 0,
  zIndex: 9999,
  fontSize: 12,
  maxWidth: '200px',
  whiteSpace: 'nowrap',
  transform: 'translate(-50%, -100%)',
  '& .tooltip-date-range': {
    fontWeight: 'medium',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '4px 8px',
    fontSize: '11px',
  },
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 5,
  right: 5,
  zIndex: 100,
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
  background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
  borderRadius: '4px',
  padding: '2px',
}));

interface GridProps {
  id: string;
  data: GridData;
  onItemHover: (item: GridItem | null) => void;
  width?: number;
  height?: number;
}

export const Grid = ({
  id: _id,
  data,
  onItemHover,
  width = 11,
  height = 11,
}: GridProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  
  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Calculate grid size - memoized to prevent recalculation
  const { rowSize, colSize } = useMemo(() => {
    if (!data.grade || data.grade.length === 0)
      return { rowSize: 0, colSize: 0 };

    const rowSize = Math.max(...data.grade.map(item => item.i));
    const colSize = Math.max(...data.grade.map(item => item.j));

    return { rowSize, colSize };
  }, [data.grade]);

  // Format timestamp with full date and time
  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

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
            .style('top', `${event.pageY - 10}px`);
        }
      },
      mouseOut: () => {
        onItemHover(null);

        // Hide tooltip
        if (tooltipRef.current) {
          select(tooltipRef.current).style('opacity', 0);
        }
      },
      touch: (event: TouchEvent, d: GridItem) => {
        event.preventDefault();
        if (!tooltipRef.current || !d.data_atualizacao) return;

        onItemHover(d);
        
        const tooltip = select(tooltipRef.current);
        tooltip.html(`
          <div class="tooltip-date-range">${formatTimestamp(d.data_atualizacao)}</div>
        `);

        const touchY = event.touches[0].pageY;
        const touchX = event.touches[0].pageX;
        tooltip
          .style('left', `${touchX}px`)
          .style('top', `${touchY - 30}px`)
          .style('opacity', '1');

        setTimeout(() => {
          tooltip.style('opacity', '0');
        }, 2000);
      }
    };
  }, [onItemHover]);

  // Memoize cell style with theme support
  const cellStyles = useMemo(
    () => ({
      visited: isDarkMode ? '#8BC34A' : '#AAC8A7',
      default: isDarkMode ? '#333333' : '#fff',
      stroke: isDarkMode ? '#888888' : '#222',
    }),
    [isDarkMode],
  );

  // Create matrix data - memoized
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

  // Calculate initial centering position
  const calculateInitialPosition = useCallback(() => {
    if (!svgRef.current || rowSize === 0 || colSize === 0) return { x: 0, y: 0 };
    
    const containerWidth = svgRef.current.clientWidth;
    const containerHeight = svgRef.current.clientHeight;
    const gridWidth = colSize * width;
    const gridHeight = rowSize * height;
    
    // Calculate position to center the grid in the container
    const x = (containerWidth - gridWidth) / 2;
    const y = (containerHeight - gridHeight) / 2;
    
    return { x, y };
  }, [rowSize, colSize, width, height]);

  // Setup drag behavior for panning
  const setupDrag = useCallback(() => {
    if (!svgRef.current) return;
    
    const svgSelection = select(svgRef.current);
    
    // Define drag behavior
    const dragHandler = drag()
      .on('drag', (event) => {
        setTranslate(prev => ({
          x: prev.x + event.dx,
          y: prev.y + event.dy
        }));
      });
    
    // Apply drag to SVG element
    svgSelection.call(dragHandler as any);
    
  }, []);

  // Initialize grid position when first rendered
  useEffect(() => {
    const initialPos = calculateInitialPosition();
    setTranslate(initialPos);
  }, [calculateInitialPosition, rowSize, colSize]);

  // D3 code for grid visualization
  useEffect(() => {
    if (!svgRef.current || rowSize === 0 || colSize === 0) return;

    // Clear previous content
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Create a group for all content with transform for zoom/pan
    const mainGroup = svg
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${translate.x},${translate.y}) scale(${scale})`);

    const gridData = createGridData();

    // Create rows
    const row = mainGroup
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
      .on('mouseout', handlers.mouseOut)
      .on('touchstart', function (event, d) {
        handlers.touch(event as TouchEvent, d);
      });
      
    // Setup dragging
    setupDrag();
    
  }, [
    data.grade,
    width,
    height,
    rowSize,
    colSize,
    handlers,
    cellStyles,
    createGridData,
    scale,
    translate,
    setupDrag
  ]);

  return (
    <GridContainer>
      <svg ref={svgRef} style={{ cursor: 'grab', width: '100%', height: '100%' }} />
      <GridTooltip ref={tooltipRef} />
      <ZoomControls>
        <IconButton 
          size="small" 
          onClick={zoomIn} 
          sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ZoomInIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={zoomOut} 
          sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ZoomOutIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={resetView} 
          sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </ZoomControls>
    </GridContainer>
  );
};