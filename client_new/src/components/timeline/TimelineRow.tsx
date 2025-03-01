// Path: components\timeline\TimelineRow.tsx
import { Box, Typography, styled } from '@mui/material';
import TimelineItem from './TimelineItem';

interface TimelineItemData {
  startDate: Date;
  endDate: Date;
  status: string;
  title?: string;
}

interface TimelineRowProps {
  title: string;
  items: TimelineItemData[];
  getPositionForDate: (date: Date) => number;
}

const RowContainer = styled(Box)({
  display: 'flex',
  height: 40,
  borderBottom: '1px solid #f5f5f5',
  position: 'relative',
});

const RowLabel = styled(Box)(({ theme }) => ({
  width: 200,
  minWidth: 200,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
}));

const RowContent = styled(Box)({
  flexGrow: 1,
  position: 'relative',
  paddingTop: 10,
});

const TimelineRow = ({ title, items, getPositionForDate }: TimelineRowProps) => {
  return (
    <RowContainer>
      <RowLabel>
        <Typography variant="body2" noWrap>
          {title}
        </Typography>
      </RowLabel>
      
      <RowContent>
        {items.map((item, index) => {
          const startPosition = getPositionForDate(item.startDate);
          const endPosition = getPositionForDate(item.endDate);
          const width = endPosition - startPosition;
          
          // Se width for muito pequeno, mostramos um ponto em vez de uma barra
          const isPoint = width < 0.5;
          
          const tooltipTitle = item.title || 
            `${item.startDate.toLocaleDateString()} - ${item.endDate.toLocaleDateString()}`;
          
          return (
            <TimelineItem
              key={index}
              start={startPosition}
              width={isPoint ? 0.5 : width}
              color={item.status === '1' ? '#4CAF50' : '#F44336'}
              title={tooltipTitle}
            />
          );
        })}
      </RowContent>
    </RowContainer>
  );
};

export default TimelineRow;