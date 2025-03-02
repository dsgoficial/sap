// Path: components\timeline\EnhancedTimeline.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import * as d3 from 'd3';

// Types
export interface TimelineItem {
  startDate: Date;
  endDate: Date;
  status: string; // "1" for available, "0" for unavailable
  label?: string; // Optional label for the tooltip
  visited?: boolean;
}

export interface TimelineGroup {
  title: string;
  data: TimelineItem[];
}

interface EnhancedTimelineProps {
  title: string;
  groups: TimelineGroup[];
  startDate?: Date; // Optional custom start date
  endDate?: Date; // Optional custom end date
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
    fontSize: '11px',
    fill: theme.palette.text.secondary,
  },
  '& .grid line': {
    stroke: '#e0e0e0',
    shapeRendering: 'crispEdges',
    opacity: 0.7,
  },
  '& .grid path': {
    strokeWidth: 0,
  },
  [theme.breakpoints.down('sm')]: {
    '& .axis text': {
      fontSize: '10px',
    },
  },
}));

const TimelineTooltip = styled('div')(({ theme }) => ({
  position: 'fixed', // Changed from absolute to fixed for better positioning
  background: theme.palette.background.paper,
  padding: '6px 10px',
  borderRadius: '4px',
  boxShadow: theme.shadows[1],
  pointerEvents: 'none',
  opacity: 0,
  zIndex: 9999, // Increased z-index to ensure visibility
  fontSize: '12px',
  maxWidth: '200px',
  border: `1px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
  transform: 'translate(-50%, -100%)', // Center horizontally and position above
  '& .tooltip-date-range': {
    fontWeight: 'medium',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '4px 8px',
    fontSize: '11px',
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
  startDate: customStartDate,
  endDate: customEndDate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle long group titles
  const maxTitleLength = useMemo(() => {
    return Math.max(...groups.map(g => g.title.length), 0);
  }, [groups]);

  // Constants for rendering - responsive adjustments
  const MARGIN = useMemo(
    () => ({
      top: isMobile ? 40 : 50, // Increased top margin
      right: isMobile ? 10 : 20,
      bottom: isMobile ? 50 : 100,
      left: maxTitleLength > 30 
        ? (isMobile ? 120 : 180) 
        : (isMobile ? 100 : 150),
    }),
    [isMobile, maxTitleLength],
  );

  // Add space between axis and first row
  const AXIS_SPACING = 10; // Space between x-axis and first row
  const ROW_HEIGHT = isMobile ? 20 : 24;
  const ROW_PADDING = isMobile ? 8 : 12;

  // Calculate content height based on responsive dimensions
  const contentHeight = useMemo(
    () => groups.length * (ROW_HEIGHT + ROW_PADDING) + AXIS_SPACING,
    [groups.length, ROW_HEIGHT, ROW_PADDING, AXIS_SPACING],
  );

  const totalHeight = useMemo(
    () => Math.max(contentHeight + MARGIN.top + MARGIN.bottom),
    [contentHeight, MARGIN.top, MARGIN.bottom],
  );

  const getWidth = () =>
    svgRef.current
      ? svgRef.current.clientWidth - MARGIN.left - MARGIN.right
      : 800;

  // Calculate date range based on data or custom dates
  const { minDate, maxDate } = useMemo(() => {
    if (groups.length === 0) {
      return {
        minDate: new Date(),
        maxDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      };
    }

    let min = customStartDate || new Date();
    let max = customEndDate || new Date();

    if (!customStartDate || !customEndDate) {
      groups.forEach(group => {
        group.data.forEach(item => {
          if (!customStartDate && item.startDate < min)
            min = new Date(item.startDate);
          if (!customEndDate && item.endDate > max)
            max = new Date(item.endDate);
        });
      });

      // Add buffer days
      if (!customStartDate) min.setDate(min.getDate() - 5);
      if (!customEndDate) max.setDate(max.getDate() + 5);
    }

    return { minDate: min, maxDate: max };
  }, [groups, customStartDate, customEndDate]);

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Main render function using D3
  useEffect(() => {
    if (!svgRef.current || groups.length === 0) return;

    const width = getWidth();

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', totalHeight);

    // Main group for visualization
    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Create scales
    const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

    // Create custom time formatter for x-axis based on date range
    const xAxisTickFormat = (date: Date) => {
      const d = new Date(date);
      const month = d3.timeFormat('%b')(d);
      const year = d.getFullYear();
      
      // If first month of year or first tick, show month + year
      if (d.getMonth() === 0 || d.getTime() === minDate.getTime()) {
        return `${month} ${year}`;
      }
      return month;
    };

    // Create a layered structure with specific z-index order
    // 1. Grid layer for grid lines (rendered behind data)
    const gridLayer = g.append('g').attr('class', 'grid-layer');
    
    // 2. Background layer for row backgrounds
    const backgroundLayer = g.append('g')
      .attr('class', 'background-layer')
      .attr('transform', `translate(0,${AXIS_SPACING})`); // Move down to leave space for axis
    
    // 3. Data layer for timeline bars
    const dataLayer = g.append('g')
      .attr('class', 'data-layer')
      .attr('transform', `translate(0,${AXIS_SPACING})`); // Move down to leave space for axis
    
    // 4. Axis layer for axes and labels (top layer)
    const axisLayer = g.append('g').attr('class', 'axis-layer');

    // Add grid lines FIRST (behind everything else)
    // Adjust grid to start after axis spacing
    const gridGenerator = d3
      .axisTop(x)
      .tickSize(-(contentHeight - AXIS_SPACING)) // Adjust grid height to avoid axis
      .tickFormat(() => '')
      .ticks(d3.timeMonth.every(1)); // Align with month ticks

    gridLayer
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${AXIS_SPACING})`) // Position grid below axis
      .call(gridGenerator);

    // Add background for each row
    backgroundLayer
      .selectAll('.timeline-row-bg')
      .data(groups)
      .enter()
      .append('rect')
      .attr('class', 'timeline-row-bg')
      .attr('x', 0)
      .attr('y', (_, i) => i * (ROW_HEIGHT + ROW_PADDING))
      .attr('width', width)
      .attr('height', ROW_HEIGHT)
      .attr('fill', (_, i) =>
        i % 2 === 0
          ? theme.palette.background.default
          : theme.palette.action.hover,
      )
      .attr('opacity', 0.3);

    // Create timeline bars in the data layer
    const groupsSelection = dataLayer
      .selectAll('.timeline-group')
      .data(groups)
      .enter()
      .append('g')
      .attr('class', 'timeline-group')
      .attr(
        'transform',
        (_, i) => `translate(0,${i * (ROW_HEIGHT + ROW_PADDING)})`,
      );

    // Add data bars
    groupsSelection.each(function (d: TimelineGroup) {
      const group = d3.select(this);

      group
        .selectAll('.timeline-bar')
        .data(d.data)
        .enter()
        .append('rect')
        .attr('class', 'timeline-bar')
        .attr('x', d => x(d.startDate))
        .attr('y', 0)
        .attr('width', d => Math.max(x(d.endDate) - x(d.startDate), 4))
        .attr('height', ROW_HEIGHT)
        .attr('fill', d =>
          d.status === '1'
            ? '#7FB77E' // Custom green that matches the sample
            : '#FF5C8D' // Custom pink-red for the bars
        )
        .attr('rx', 1) // Reduced corner radius
        .attr('ry', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          if (!tooltipRef.current) return;
          
          const tooltip = d3.select(tooltipRef.current);

          // Show simplified tooltip with date range
          tooltip.html(`
            <div class="tooltip-date-range">${formatDate(d.startDate)} - ${formatDate(d.endDate)}</div>
          `);

          // Get mouse position relative to viewport
          tooltip
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 10}px`)
            .style('transform', 'translate(-50%, -100%)')
            .style('opacity', 1);
        })
        .on('mousemove', function (event) {
          if (!tooltipRef.current) return;
          
          // Update tooltip position as mouse moves
          d3.select(tooltipRef.current)
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', function () {
          if (!tooltipRef.current) return;
          d3.select(tooltipRef.current).style('opacity', 0);
        })
        .on('touchstart', function (event, d) {
          // Handle touch events for mobile
          event.preventDefault();
          if (!tooltipRef.current) return;

          const tooltip = d3.select(tooltipRef.current);

          // Show simplified tooltip with date range
          tooltip.html(`
            <div class="tooltip-date-range">${formatDate(d.startDate)} - ${formatDate(d.endDate)}</div>
          `);

          // Position tooltip above the touch point
          const touchY = event.touches[0].pageY;
          const touchX = event.touches[0].pageX;
          tooltip
            .style('left', `${touchX}px`)
            .style('top', `${touchY - 30}px`)
            .style('opacity', 1);

          // Hide tooltip after delay
          setTimeout(() => {
            tooltip.style('opacity', 0);
          }, 2000);
        });
    });

    // Add x-axis at the top (before the data bars)
    const xAxis = d3
      .axisTop(x)
      .tickFormat(d => xAxisTickFormat(d as Date))
      .ticks(d3.timeMonth.every(1)); // Show every month

    const gX = axisLayer
      .append('g')
      .attr('class', 'axis')
      .call(xAxis);

    // Rotate labels if needed
    if (!isMobile) {
      gX.selectAll('text')
        .style('text-anchor', 'middle')
    } else {
      gX.selectAll('text')
        .style('text-anchor', 'start')
        .attr('transform', 'rotate(-45)')
        .attr('dx', '0.5em')
        .attr('dy', '0.5em');
    }

    // Add y axis labels (group titles) - also positioned with the proper spacing
    axisLayer
      .append('g')
      .attr('class', 'axis-labels')
      .attr('transform', `translate(0,${AXIS_SPACING})`) // Apply the same spacing
      .selectAll('.group-label')
      .data(groups)
      .enter()
      .append('text')
      .attr('class', 'group-label')
      .attr('x', -10)
      .attr('y', (_, i) => i * (ROW_HEIGHT + ROW_PADDING) + ROW_HEIGHT / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', theme.palette.text.primary)
      .style('font-size', isMobile ? '10px' : '12px')
      .each(function(d) {
        // If title is too long, truncate it
        const text = d3.select(this);
        const title = d.title;
        const maxLength = 22;
        
        if (title.length > maxLength) {
          text.text(title.substring(0, maxLength) + '...')
            .append('title')
            .text(title);
        } else {
          text.text(title);
        }
      });
  }, [
    groups,
    minDate,
    maxDate,
    totalHeight,
    theme,
    isMobile,
    MARGIN,
    ROW_HEIGHT,
    ROW_PADDING,
    contentHeight,
    AXIS_SPACING,
  ]);

  if (groups.length === 0) {
    return (
      <Paper
        elevation={1}
        sx={{ p: 2, height: totalHeight, width: '100%' }}
      >
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
    <Paper
      elevation={1}
      sx={{ p: isMobile ? 1 : 2, height: totalHeight, width: '100%' }}
    >
      <Typography
        variant={isMobile ? 'subtitle1' : 'h6'}
        align="center"
        gutterBottom
      >
        {title}
      </Typography>

      <TimelineContainer>
        {/* Main SVG container */}
        <svg
          ref={svgRef}
          width="100%"
          height={totalHeight - (isMobile ? 40 : 60)}
        />

        {/* Tooltip */}
        <TimelineTooltip ref={tooltipRef} />
      </TimelineContainer>
    </Paper>
  );
};