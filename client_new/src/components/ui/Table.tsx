// Path: components\ui\Table.tsx
import { ReactNode, useState, useEffect } from 'react';
import {
  Table as MuiTable,
  TableProps as MuiTableProps,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Pagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  styled,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Column<T extends Record<string, any>> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  maxWidth?: number;
  format?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T extends Record<string, any>>
  extends Omit<MuiTableProps, 'rows'> {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  pagination?: {
    page: number;
    rowsPerPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    orderBy: string;
    order: 'asc' | 'desc';
    onSort: (property: string) => void;
  };
  rowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  rowBackgroundColor?: (row: T, index: number) => string | undefined;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  localization?: {
    emptyDataMessage?: string;
    searchPlaceholder?: string;
    pagination?: {
      labelRowsPerPage?: string;
      of?: string;
      firstPage?: string;
      previousPage?: string;
      nextPage?: string;
      lastPage?: string;
    };
  };
}

const LoadingContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: 200,
}));

const EmptyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: 200,
  backgroundColor: theme.palette.background.default,
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));

// Default Portuguese localization
const DEFAULT_LOCALIZATION = {
  emptyDataMessage: 'Nenhum dado encontrado',
  searchPlaceholder: 'Buscar',
  pagination: {
    labelRowsPerPage: 'Registros por página',
    of: 'de',
    firstPage: 'Primeira página',
    previousPage: 'Página anterior',
    nextPage: 'Próxima página',
    lastPage: 'Última página',
  },
};

export function Table<T extends Record<string, any>>({
  columns,
  rows,
  isLoading = false,
  emptyMessage,
  searchPlaceholder,
  pagination,
  sorting,
  rowKey,
  onRowClick,
  rowBackgroundColor,
  stickyHeader = false,
  maxHeight,
  localization: customLocalization,
  ...rest
}: TableProps<T>) {
  // Merge custom localization with default
  const localization = {
    ...DEFAULT_LOCALIZATION,
    ...customLocalization,
    pagination: {
      ...DEFAULT_LOCALIZATION.pagination,
      ...(customLocalization?.pagination || {}),
    },
  };

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState<T[]>(rows);

  // Update filtered rows when search term or rows change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRows(rows);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = rows.filter(row => {
      // Search through all properties of the row
      return Object.keys(row).some(key => {
        const value = row[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTermLower);
      });
    });

    setFilteredRows(filtered);
  }, [searchTerm, rows]);

  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) {
      return rowKey(row);
    }
    return index;
  };

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Paper>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </Paper>
    );
  }

  // Search bar component
  const SearchBar = () => (
    <SearchContainer>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={searchPlaceholder || localization.searchPlaceholder}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </SearchContainer>
  );

  // Render empty state
  if (filteredRows.length === 0) {
    return (
      <Paper>
        <SearchBar />
        <EmptyContainer>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage || localization.emptyDataMessage}
          </Typography>
        </EmptyContainer>
      </Paper>
    );
  }

  return (
    <Paper sx={{ maxHeight }}>
      <SearchBar />
      <TableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} {...rest}>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    fontWeight: 600,
                  }}
                >
                  {sorting && column.sortable ? (
                    <TableSortLabel
                      active={sorting.orderBy === column.id}
                      direction={
                        sorting.orderBy === column.id ? sorting.order : 'asc'
                      }
                      onClick={() => sorting.onSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => {
              const backgroundColor = rowBackgroundColor
                ? rowBackgroundColor(row, index)
                : undefined;

              return (
                <TableRow
                  hover
                  onClick={() => handleRowClick(row)}
                  key={getRowKey(row, index)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor,
                    '&:nth-of-type(odd)': !backgroundColor
                      ? { backgroundColor: 'action.hover' }
                      : {},
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  {columns.map(column => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {pagination && (
        <PaginationContainer>
          <Pagination
            count={Math.ceil(pagination.totalRows / pagination.rowsPerPage)}
            page={pagination.page}
            onChange={(_, page) => pagination.onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
            size="medium"
            variant="outlined"
            shape="rounded"
            aria-label="Navegação paginada"
            getItemAriaLabel={type => {
              switch (type) {
                case 'first':
                  return localization.pagination?.firstPage || '';
                case 'previous':
                  return localization.pagination?.previousPage || '';
                case 'next':
                  return localization.pagination?.nextPage || '';
                case 'last':
                  return localization.pagination?.lastPage || '';
                default:
                  return `Página ${type}`;
              }
            }}
          />
        </PaginationContainer>
      )}
    </Paper>
  );
}
