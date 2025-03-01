// Path: components\timeline\EnhancedTimeline.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import * as d3 from 'd3';

// Types
export interface TimelineItem {
  startDate: Date;
  endDate: Date;
  status: string; // "1" for available, "0" for unavailable
  label?: string; // Optional label for the tooltip
}

export interface TimelineGroup {
  title: string;
  data: TimelineItem[];
}

interface EnhancedTimelineProps {
  title: string;
  groups: TimelineGroup[];
  height?: number;
  startDate?: Date; // Optional custom start date
  endDate?: Date;   // Optional custom end date
}

// Styled components
const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  fontFamily: theme.typography.fontFamily,
  '& .axis path, & .axis line': {
    fill: 'none',
    stroke: '#ddd',
    shapeRendering: 'crispEdges',
  },
  '& .axis text': {
    fontSize: '12px',
    fill: theme.palette.text.secondary,
  },
  '& .grid line': {
    stroke: '#ddd',
    shapeRendering: 'crispEdges',
  },
  '& .grid path': {
    strokeWidth: 0,
  },
  '& .zoom-controls': {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    gap: '5px',
    zIndex: 10,
  },
  '& .zoom-button': {
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    boxShadow: theme.shadows[1],
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .subchartContainer': {
    marginTop: '10px',
    height: '40px',
    position: 'relative',
  },
  '& .subchartBrush': {
    cursor: 'grab',
  },
}));

const TimelineTooltip = styled('div')(({ theme }) => ({
  position: 'absolute',
  background: theme.palette.background.paper,
  padding: '8px 12px',
  borderRadius: '4px',
  boxShadow: theme.shadows[2],
  pointerEvents: 'none',
  opacity: 0,
  zIndex: 100,
  fontSize: '12px',
  maxWidth: '250px',
  '& .tooltip-title': {
    fontWeight: 'bold',
    marginBottom: '4px',
    color: theme.palette.primary.main,
  },
  '& .tooltip-date': {
    color: theme.palette.text.secondary,
    marginBottom: '2px',
  },
  '& .tooltip-status': {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  '& .tooltip-status-icon': {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  '& .tooltip-status-text': {
    fontWeight: 'medium',
  },
}));

const NoDataContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100px',
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

export const EnhancedTimeline: React.FC<EnhancedTimelineProps> = ({ 
  title, 
  groups, 
  height = 400,
  startDate: customStartDate,
  endDate: customEndDate
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [brushExtent, setBrushExtent] = useState<[Date, Date] | null>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);

  // Constants for rendering
  const MARGIN = { top: 40, right: 20, bottom: 50, left: 150 };
  const ROW_HEIGHT = 30;
  const ROW_PADDING = 15;
  const SUBCHART_HEIGHT = 40;
  
  // Calculate dimensions
  const contentHeight = groups.length * (ROW_HEIGHT + ROW_PADDING);
  const totalHeight = Math.max(height, contentHeight + MARGIN.top + MARGIN.bottom + SUBCHART_HEIGHT + 20);
  const getWidth = () => svgRef.current ? svgRef.current.clientWidth - MARGIN.left - MARGIN.right : 800;

  // Calculate date range based on data or custom dates
  const { minDate, maxDate } = useMemo(() => {
    if (groups.length === 0) {
      return { 
        minDate: new Date(), 
        maxDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
      };
    }

    let min = customStartDate || new Date();
    let max = customEndDate || new Date();
    
    if (!customStartDate || !customEndDate) {
      groups.forEach(group => {
        group.data.forEach(item => {
          if (!customStartDate && item.startDate < min) min = new Date(item.startDate);
          if (!customEndDate && item.endDate > max) max = new Date(item.endDate);
        });
      });
    
      // Add buffer days
      if (!customStartDate) min.setDate(min.getDate() - 5);
      if (!customEndDate) max.setDate(max.getDate() + 5);
    }
    
    return { minDate: min, maxDate: max };
  }, [groups, customStartDate, customEndDate]);

  // Reset zoom function
  const resetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        //@ts-ignore - d3 typing issue
        d3.zoom().transform,
        d3.zoomIdentity
      );
      setBrushExtent(null);
      setZoomTransform(null);
    }
  };

  // Zoom in function
  const zoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        //@ts-ignore - d3 typing issue
        d3.zoom().scaleBy,
        2
      );
    }
  };

  // Zoom out function
  const zoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        //@ts-ignore - d3 typing issue
        d3.zoom().scaleBy,
        0.5
      );
    }
  };

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Main render function using D3
  useEffect(() => {
    if (!svgRef.current || groups.length === 0) return;

    const width = getWidth();
    
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', totalHeight);
    
    // Create clip path for zoom
    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', contentHeight);
    
    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [width, contentHeight]])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
        
        // Update axes
        gX.call(
          xAxis.scale(event.transform.rescaleX(x))
        );
        
        // Update grid lines
        gGrid.call(
          gridGenerator.scale(event.transform.rescaleX(x))
        );
        
        // Update bars
        updateBars(event.transform);
      });
    
    svg.call(zoom);
    
    // Main group for visualization
    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);
    
    // Create scales
    const x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);
    
    const xBrush = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);
    
    // Create axes
    const xAxis = d3.axisBottom(x)
      .tickFormat((d) => d3.timeFormat('%b %Y')(d as Date));
    
    const gX = g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${contentHeight})`)
      .call(xAxis);
    
    // Add grid lines
    const gridGenerator = d3.axisBottom(x)
      .tickSize(-contentHeight)
      .tickFormat(() => '');
    
    const gGrid = g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${contentHeight})`)
      .call(gridGenerator);
    
    // Group for content with clip path
    const contentGroup = g.append('g')
      .attr('clip-path', 'url(#clip)')
      .attr('class', 'content');
    
    // Add y axis labels (group titles)
    g.append('g')
      .attr('class', 'axis-labels')
      .selectAll('.group-label')
      .data(groups)
      .enter()
      .append('text')
      .attr('class', 'group-label')
      .attr('x', -10)
      .attr('y', (d, i) => i * (ROW_HEIGHT + ROW_PADDING) + ROW_HEIGHT / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', theme.palette.text.primary)
      .text(d => d.title);
    
    // Function to update bar positions during zoom
    const updateBars = (transform?: d3.ZoomTransform) => {
      const xScale = transform ? transform.rescaleX(x) : x;
      
      // Update all bars
      contentGroup.selectAll('.timeline-group').each(function(this: SVGGElement, d: any, i: number) {
        d3.select(this)
          .selectAll('.timeline-bar')
          .attr('x', (d: any) => xScale(d.startDate))
          .attr('width', (d: any) => {
            const width = Math.max(
              xScale(d.endDate) - xScale(d.startDate),
              4 // Minimum width for visibility
            );
            return width;
          });
      });
    };
    
    // Create timeline bars
    const groupsSelection = contentGroup.selectAll('.timeline-group')
      .data(groups)
      .enter()
      .append('g')
      .attr('class', 'timeline-group')
      .attr('transform', (d, i) => `translate(0,${i * (ROW_HEIGHT + ROW_PADDING)})`);
    
    // Add background for each row
    groupsSelection.append('rect')
      .attr('class', 'timeline-row-bg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', ROW_HEIGHT)
      .attr('fill', (d, i) => i % 2 === 0 ? theme.palette.background.default : theme.palette.action.hover)
      .attr('opacity', 0.3);
    
    // Add data bars
    groupsSelection.each(function(this: SVGGElement, d: TimelineGroup, groupIndex: number) {
      const group = d3.select(this);
      
      group.selectAll('.timeline-bar')
        .data(d.data)
        .enter()
        .append('rect')
        .attr('class', 'timeline-bar')
        .attr('x', d => x(d.startDate))
        .attr('y', 0)
        .attr('width', d => Math.max(x(d.endDate) - x(d.startDate), 4))
        .attr('height', ROW_HEIGHT)
        .attr('fill', d => d.status === '1' ? theme.palette.success.main : theme.palette.error.main)
        .attr('rx', 4)
        .attr('ry', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          if (!tooltipRef.current) return;
          
          const tooltip = d3.select(tooltipRef.current);
          
          // Show tooltip with data details
          tooltip.html(`
            <div class="tooltip-title">${groups[groupIndex].title}</div>
            <div class="tooltip-date">De: ${formatDate(d.startDate)}</div>
            <div class="tooltip-date">Até: ${formatDate(d.endDate)}</div>
            <div class="tooltip-status">
              <div class="tooltip-status-icon" style="background-color: ${d.status === '1' ? theme.palette.success.main : theme.palette.error.main}"></div>
              <div class="tooltip-status-text">${d.status === '1' ? 'Disponível' : 'Indisponível'}</div>
            </div>
            ${d.label ? `<div class="tooltip-info">${d.label}</div>` : ''}
          `);
          
          // Position tooltip near mouse
          const [x, y] = d3.pointer(event, document.body);
          tooltip
            .style('left', `${x + 15}px`)
            .style('top', `${y - 10}px`)
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          if (!tooltipRef.current) return;
          d3.select(tooltipRef.current).style('opacity', 0);
        });
    });
    
    // Create sub-chart (overview)
    const subchartGroup = svg.append('g')
      .attr('class', 'subchart')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top + contentHeight + 30})`);
    
    // Add background for subchart
    subchartGroup.append('rect')
      .attr('width', width)
      .attr('height', SUBCHART_HEIGHT)
      .attr('fill', theme.palette.background.default)
      .attr('rx', 4);
    
    // Create mini bars for overview
    groups.forEach((group, groupIndex) => {
      const rowHeight = SUBCHART_HEIGHT / groups.length;
      
      subchartGroup.selectAll(`.subchart-bar-${groupIndex}`)
        .data(group.data)
        .enter()
        .append('rect')
        .attr('class', `subchart-bar-${groupIndex}`)
        .attr('x', d => xBrush(d.startDate))
        .attr('y', groupIndex * rowHeight)
        .attr('width', d => Math.max(xBrush(d.endDate) - xBrush(d.startDate), 2))
        .attr('height', rowHeight)
        .attr('fill', d => d.status === '1' ? theme.palette.success.main : theme.palette.error.main)
        .attr('opacity', 0.7)
        .attr('rx', 2)
        .attr('ry', 2);
    });
    
    // Add brush for subchart navigation
    const brush = d3.brushX()
      .extent([[0, 0], [width, SUBCHART_HEIGHT]])
      .on('brush', (event) => {
        if (!event.selection) return;
        
        const [x0, x1] = event.selection as [number, number];
        const [date0, date1] = [xBrush.invert(x0), xBrush.invert(x1)];
        setBrushExtent([date0, date1]);
        
        // Update main chart with the brush selection
        const newXDomain = [date0, date1];
        x.domain(newXDomain);
        
        gX.transition().call(xAxis);
        gGrid.transition().call(gridGenerator);
        updateBars();
      })
      .on('end', (event) => {
        if (!event.selection) {
          setBrushExtent(null);
          x.domain([minDate, maxDate]);
          gX.transition().call(xAxis);
          gGrid.transition().call(gridGenerator);
          updateBars();
        }
      });
    
    // Apply brush to subchart
    const brushG = subchartGroup.append('g')
      .attr('class', 'subchartBrush')
      .call(brush);
    
    // Add axis for subchart
    subchartGroup.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${SUBCHART_HEIGHT})`)
      .call(d3.axisBottom(xBrush).ticks(5).tickFormat((d) => d3.timeFormat('%b %Y')(d as Date)));
    
    // Initial brush selection if needed
    if (brushExtent) {
      brush.move(brushG, brushExtent.map(xBrush) as [number, number]);
    }
    
    // Apply initial zoom transform if any
    if (zoomTransform) {
      g.attr('transform', `translate(${MARGIN.left + zoomTransform.x}, ${MARGIN.top}) scale(${zoomTransform.k})`);
    }
    
  }, [groups, minDate, maxDate, totalHeight, theme, brushExtent, zoomTransform]);

  if (groups.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, height, width: '100%' }}>
        <Typography variant="h6" align="center" gutterBottom>
          {title}
        </Typography>
        <NoDataContainer>
          <Typography variant="body2">
            Nenhum dado disponível para visualização.
          </Typography>
        </NoDataContainer>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2, height: totalHeight, width: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      
      <TimelineContainer>
        {/* Zoom control buttons */}
        <div className="zoom-controls">
          <div className="zoom-button" onClick={resetZoom} title="Reset zoom">
            <ZoomOutMapIcon fontSize="small" />
          </div>
          <div className="zoom-button" onClick={zoomIn} title="Zoom in">
            <ZoomInIcon fontSize="small" />
          </div>
          <div className="zoom-button" onClick={zoomOut} title="Zoom out">
            <ZoomOutIcon fontSize="small" />
          </div>
        </div>
        
        {/* Main SVG container */}
        <svg ref={svgRef} width="100%" height={totalHeight - 60} />
        
        {/* Tooltip */}
        <TimelineTooltip ref={tooltipRef} />
      </TimelineContainer>
    </Paper>
  );
};

export default EnhancedTimeline;