// Path: components\timeline\EnhancedTimeline.tsx
import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { select, scaleTime, axisTop, timeFormat, timeMonth } from 'd3';

// Types
export interface TimelineItem {
  startDate: Date;
  endDate: Date;
  status: string | number;
  label?: string;
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
    stroke: theme.palette.divider,
    shapeRendering: 'crispEdges',
  },
  '& .axis text': {
    fontSize: '11px',
    fill: theme.palette.text.secondary,
  },
  '& .grid line': {
    stroke: theme.palette.divider,
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
  position: 'fixed',
  background: theme.palette.background.paper,
  padding: '6px 10px',
  borderRadius: '4px',
  boxShadow: theme.shadows[1],
  pointerEvents: 'none',
  opacity: 0,
  zIndex: 9999,
  fontSize: '12px',
  maxWidth: '200px',
  border: `1px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
  transform: 'translate(-50%, -100%)',
  '& .tooltip-date-range': {
    fontWeight: 'medium',
    marginBottom: '4px',
  },
  '& .tooltip-status': {
    display: 'flex',
    alignItems: 'center',
  },
  '& .status-indicator': {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '5px',
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

export const EnhancedTimeline: React.FC<EnhancedTimelineProps> = React.memo(
  ({ title, groups, startDate: customStartDate, endDate: customEndDate }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Handle long group titles - memoized to prevent recalculation
    const maxTitleLength = useMemo(() => {
      // reduce em vez de spread em Math.max (evita RangeError com muitos grupos).
      return groups.reduce((max, g) => Math.max(max, g.title.length), 0);
    }, [groups]);

    // Constants for rendering - responsive adjustments
    const CONSTANTS = useMemo(() => {
      const AXIS_SPACING = 10;
      const ROW_HEIGHT = isMobile ? 20 : 24;
      const ROW_PADDING = isMobile ? 8 : 12;

      const MARGIN = {
        top: isMobile ? 40 : 50,
        right: isMobile ? 10 : 20,
        bottom: isMobile ? 50 : 100,
        left:
          maxTitleLength > 30 ? (isMobile ? 120 : 180) : isMobile ? 100 : 150,
      };

      return {
        AXIS_SPACING,
        ROW_HEIGHT,
        ROW_PADDING,
        MARGIN,
      };
    }, [isMobile, maxTitleLength]);

    const { AXIS_SPACING, ROW_HEIGHT, ROW_PADDING, MARGIN } = CONSTANTS;

    // Calculate content height based on responsive dimensions - memoized to prevent recalculation
    const contentHeight = useMemo(
      () => groups.length * (ROW_HEIGHT + ROW_PADDING) + AXIS_SPACING,
      [groups.length, ROW_HEIGHT, ROW_PADDING, AXIS_SPACING],
    );

    const totalHeight = useMemo(
      () => Math.max(contentHeight + MARGIN.top + MARGIN.bottom, 300),
      [contentHeight, MARGIN.top, MARGIN.bottom],
    );

    // Mede a largura do SVG via ResizeObserver para redesenhar em qualquer
    // resize (inclusive dentro do mesmo breakpoint), não só na 1ª montagem.
    useEffect(() => {
      const el = svgRef.current;
      if (!el) return;
      const update = () => setContainerWidth(el.clientWidth);
      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    // Calculate date range based on data or custom dates
    const { minDate, maxDate } = useMemo(() => {
      if (groups.length === 0) {
        return {
          minDate: new Date(),
          maxDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        };
      }

      let min = customStartDate ? new Date(customStartDate) : new Date();
      let max = customEndDate ? new Date(customEndDate) : new Date();

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

    // Format date for tooltip - memoized to avoid recreating on each render
    const formatDate = useCallback((date: Date) => {
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }, []);

    // Memoize the bar styles to prevent recalculation
    const barStyles = useMemo(() => {
      return {
        available: '#7FB77E', // Custom green
        unavailable: '#FF5C8D', // Custom pink-red
      };
    }, []);

    // Memoize tooltip handlers to prevent recreating on each render
    const tooltipHandlers = useMemo(() => {
      return {
        show: (event: MouseEvent, d: TimelineItem) => {
          if (!tooltipRef.current) return;

          const isActive = d.status === '1' || d.status === 1;
          const statusText = isActive ? 'Ativo' : 'Inativo';
          const statusColor = isActive
            ? barStyles.available
            : barStyles.unavailable;

          const tooltip = select(tooltipRef.current);
          tooltip.html(`
            <div class="tooltip-date-range">${formatDate(d.startDate)} - ${formatDate(d.endDate)}</div>
            <div class="tooltip-status">
              <span class="status-indicator" style="background-color: ${statusColor}"></span>
              <span>Status: ${statusText}</span>
            </div>
          `);

          tooltip
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 10}px`)
            .style('transform', 'translate(-50%, -100%)')
            .style('opacity', '1');
        },
        move: (event: MouseEvent) => {
          if (!tooltipRef.current) return;
          select(tooltipRef.current)
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 10}px`);
        },
        hide: () => {
          if (!tooltipRef.current) return;
          select(tooltipRef.current).style('opacity', '0');
        },
        touch: (event: TouchEvent, d: TimelineItem) => {
          event.preventDefault();
          if (!tooltipRef.current) return;

          const isActive = d.status === '1' || d.status === 1;
          const statusText = isActive ? 'Ativo' : 'Inativo';
          const statusColor = isActive
            ? barStyles.available
            : barStyles.unavailable;

          const tooltip = select(tooltipRef.current);
          tooltip.html(`
            <div class="tooltip-date-range">${formatDate(d.startDate)} - ${formatDate(d.endDate)}</div>
            <div class="tooltip-status">
              <span class="status-indicator" style="background-color: ${statusColor}"></span>
              <span>Status: ${statusText}</span>
            </div>
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
        },
      };
    }, [formatDate, barStyles]);

    // Cores derivadas do tema, memoizadas — o efeito d3 depende só destas
    // strings em vez do objeto `theme` inteiro (reduz teardown/rebuild).
    const themeColors = useMemo(
      () => ({
        rowEven: theme.palette.background.default,
        rowOdd: theme.palette.action.hover,
        label: theme.palette.text.primary,
      }),
      [
        theme.palette.background.default,
        theme.palette.action.hover,
        theme.palette.text.primary,
      ],
    );

    // Main render function using D3
    useEffect(() => {
      const width = containerWidth - MARGIN.left - MARGIN.right;
      if (!svgRef.current || groups.length === 0 || width <= 0) return;

      // Clear previous content
      select(svgRef.current).selectAll('*').remove();

      // Create SVG
      const svg = select(svgRef.current)
        .attr('width', width + MARGIN.left + MARGIN.right)
        .attr('height', totalHeight);

      // Main group for visualization
      const g = svg
        .append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

      // Create scales
      const x = scaleTime().domain([minDate, maxDate]).range([0, width]);

      // Create custom time formatter for x-axis based on date range
      const xAxisTickFormat = (d: Date) => {
        const month = timeFormat('%b')(d);
        const year = d.getFullYear();

        // If first month of year or first tick, show month + year
        if (d.getMonth() === 0 || d.getTime() === minDate.getTime()) {
          return `${month} ${year}`;
        }
        return month;
      };

      // Create layered structure with specific z-index order
      const gridLayer = g.append('g').attr('class', 'grid-layer');
      const backgroundLayer = g
        .append('g')
        .attr('class', 'background-layer')
        .attr('transform', `translate(0,${AXIS_SPACING})`);
      const dataLayer = g
        .append('g')
        .attr('class', 'data-layer')
        .attr('transform', `translate(0,${AXIS_SPACING})`);
      const axisLayer = g.append('g').attr('class', 'axis-layer');

      // Add grid lines
      const gridGenerator = axisTop(x)
        .tickSize(-(contentHeight - AXIS_SPACING))
        .tickFormat(() => '')
        .ticks(timeMonth.every(1));

      gridLayer
        .append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${AXIS_SPACING})`)
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
          i % 2 === 0 ? themeColors.rowEven : themeColors.rowOdd,
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
      groupsSelection.each(function (groupData: TimelineGroup) {
        const group = select(this);

        group
          .selectAll('.timeline-bar')
          .data(groupData.data)
          .enter()
          .append('rect')
          .attr('class', 'timeline-bar')
          .attr('x', d => x(d.startDate))
          .attr('y', 0)
          .attr('width', d => Math.max(x(d.endDate) - x(d.startDate), 4))
          .attr('height', ROW_HEIGHT)
          .attr('fill', d => {
            const statusValue = d.status;
            return statusValue === '1' || statusValue === 1
              ? barStyles.available
              : barStyles.unavailable;
          })
          .attr('rx', 1)
          .attr('ry', 1)
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            tooltipHandlers.show(event as MouseEvent, d);
          })
          .on('mousemove', function (event) {
            tooltipHandlers.move(event as MouseEvent);
          })
          .on('mouseout', tooltipHandlers.hide)
          .on('touchstart', function (event, d) {
            tooltipHandlers.touch(event as TouchEvent, d);
          });
      });

      // Add x-axis at the top
      const xAxis = axisTop(x)
        .tickFormat(d => xAxisTickFormat(d as Date))
        .ticks(timeMonth.every(1));

      const gX = axisLayer.append('g').attr('class', 'axis').call(xAxis);

      // Rotate labels if needed
      if (!isMobile) {
        gX.selectAll('text').style('text-anchor', 'middle');
      } else {
        gX.selectAll('text')
          .style('text-anchor', 'start')
          .attr('transform', 'rotate(-45)')
          .attr('dx', '0.5em')
          .attr('dy', '0.5em');
      }

      // Add y axis labels (group titles)
      axisLayer
        .append('g')
        .attr('class', 'axis-labels')
        .attr('transform', `translate(0,${AXIS_SPACING})`)
        .selectAll('.group-label')
        .data(groups)
        .enter()
        .append('text')
        .attr('class', 'group-label')
        .attr('x', -10)
        .attr('y', (_, i) => i * (ROW_HEIGHT + ROW_PADDING) + ROW_HEIGHT / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', themeColors.label)
        .style('font-size', isMobile ? '10px' : '12px')
        .each(function (d) {
          // If title is too long, truncate it
          const text = select(this);
          const title = d.title;
          const maxLength = 22;

          if (title.length > maxLength) {
            text
              .text(title.substring(0, maxLength) + '...')
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
      themeColors,
      isMobile,
      MARGIN,
      ROW_HEIGHT,
      ROW_PADDING,
      contentHeight,
      AXIS_SPACING,
      containerWidth,
      tooltipHandlers,
      barStyles,
    ]);

    if (groups.length === 0) {
      return (
        <Paper elevation={1} sx={{ p: 2, height: totalHeight, width: '100%' }}>
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
          <svg
            ref={svgRef}
            width="100%"
            height={totalHeight - (isMobile ? 40 : 60)}
          />
          <TimelineTooltip ref={tooltipRef} />
        </TimelineContainer>
      </Paper>
    );
  },
);

EnhancedTimeline.displayName = 'EnhancedTimeline';
