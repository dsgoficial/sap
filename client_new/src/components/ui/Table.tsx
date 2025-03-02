// Path: components\ui\Table.tsx
import { ReactNode, useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  IconButton,
  Collapse,
  Button,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Column<T extends Record<string, any>> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  maxWidth?: number;
  format?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  priority?: number; // Higher number = higher priority (show on mobile)
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
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    padding: theme.spacing(1),
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const CardViewItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
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

// Isolated search input component that doesn't re-render with parent
interface SearchBarProps {
  placeholder: string;
  onSearch: (term: string) => void;
}

const SearchBar = memo(({ placeholder, onSearch }: SearchBarProps) => {
  // Use local state for input value to avoid losing focus
  const [inputValue, setInputValue] = useState('');
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onSearch(newValue);
  };
  
  return (
    <SearchContainer>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </SearchContainer>
  );
});

// Ensure displayName is set for memoized component
SearchBar.displayName = 'SearchBar';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Merge custom localization with default
  const localization = {
    ...DEFAULT_LOCALIZATION,
    ...customLocalization,
    pagination: {
      ...DEFAULT_LOCALIZATION.pagination,
      ...(customLocalization?.pagination || {}),
    },
  };

  // Columns state - keeping for mobile prioritization
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {},
  );

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState<T[]>(rows);
  
  // Internal sorting state when external sorting is not provided
  const [internalSorting, setInternalSorting] = useState<{
    orderBy: string;
    order: 'asc' | 'desc';
  } | null>(null);
  
  // Card view for mobile
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Initialize column visibility based on priority
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    columns.forEach(column => {
      if (isMobile) {
        // On mobile, only show high priority columns by default
        initialVisibility[column.id] =
          column.priority !== undefined ? column.priority >= 3 : true;
      } else {
        initialVisibility[column.id] = true;
      }
    });
    setVisibleColumns(initialVisibility);
  }, [columns, isMobile]);

  // Search handler - memoized to prevent recreating it on each render
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

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

  // Apply sorting to filtered rows
  const sortedRows = useMemo(() => {
    let sortedData = [...filteredRows];
    
    // Use external sorting if provided, otherwise use internal
    const sortConfig = sorting || internalSorting;
    
    if (sortConfig && sortConfig.orderBy) {
      sortedData.sort((a, b) => {
        // Get values to compare
        const valueA = a[sortConfig.orderBy];
        const valueB = b[sortConfig.orderBy];
        
        // Handle nulls/undefined
        if (valueA == null) return sortConfig.order === 'asc' ? -1 : 1;
        if (valueB == null) return sortConfig.order === 'asc' ? 1 : -1;
        
        // Different comparison based on data type
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortConfig.order === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // Default string comparison
        const stringA = String(valueA).toLowerCase();
        const stringB = String(valueB).toLowerCase();
        return sortConfig.order === 'asc'
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      });
    }
    
    return sortedData;
  }, [filteredRows, sorting, internalSorting]);

  // Row key getter
  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) {
      return rowKey(row);
    }
    return index;
  };

  // Row click handler
  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Row expansion toggle (mobile view)
  const toggleRowExpansion = (rowId: string | number) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId.toString()]: !prev[rowId.toString()],
    }));
  };

  // Column sort handler
  const handleSort = (columnId: string) => {
    // Column must be sortable to proceed
    if (!columns.find(col => col.id === columnId)?.sortable) {
      return;
    }
    
    // If external sorting is provided, use it
    if (sorting && sorting.onSort) {
      sorting.onSort(columnId);
      return;
    }
    
    // Otherwise use internal sorting
    setInternalSorting(prevSort => {
      if (!prevSort || prevSort.orderBy !== columnId) {
        // New column - start with ascending
        return { orderBy: columnId, order: 'asc' };
      } else {
        // Toggle direction
        return {
          orderBy: columnId,
          order: prevSort.order === 'asc' ? 'desc' : 'asc',
        };
      }
    });
  };

  // Filter visible columns for current view
  const displayColumns = useMemo(
    () => columns.filter(column => visibleColumns[column.id]),
    [columns, visibleColumns],
  );

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

  // Render empty state
  if (sortedRows.length === 0) {
    return (
      <Paper>
        <SearchBar
          placeholder={searchPlaceholder || localization.searchPlaceholder}
          onSearch={handleSearch}
        />
        <EmptyContainer>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage || localization.emptyDataMessage}
          </Typography>
        </EmptyContainer>
      </Paper>
    );
  }

  // Get current sort config (external or internal)
  const sortConfig = sorting || internalSorting;

  // Card view for mobile devices
  if (isMobile) {
    return (
      <Paper sx={{ maxHeight, overflow: 'auto' }}>
        <SearchBar
          placeholder={searchPlaceholder || localization.searchPlaceholder}
          onSearch={handleSearch}
        />
        <Box sx={{ p: 2 }}>
          {sortedRows.map((row, idx) => {
            const rowId = getRowKey(row, idx);
            const isExpanded = expandedRows[rowId.toString()];

            return (
              <CardViewItem
                key={rowId}
                elevation={1}
                sx={{
                  bgcolor: rowBackgroundColor
                    ? rowBackgroundColor(row, idx)
                    : idx % 2 === 0
                      ? 'action.hover'
                      : 'background.paper',
                }}
              >
                <CardContent sx={{ pb: 1, pt: 1, px: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" component="div">
                      {/* Display first high priority column as title */}
                      {(() => {
                        const mainColumn =
                          columns.find(col => col.priority === 5) || columns[0];
                        const value = row[mainColumn.id];
                        return mainColumn.format
                          ? mainColumn.format(value, row)
                          : value;
                      })()}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleRowExpansion(rowId)}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  {/* Always show key info (priority >= 4) */}
                  <Box sx={{ mt: 1 }}>
                    {columns
                      .filter(
                        col => (col.priority || 0) >= 4 && col.priority !== 5,
                      )
                      .map(column => (
                        <Box
                          key={column.id}
                          sx={{
                            mb: 0.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {column.label}:
                          </Typography>
                          <Typography variant="body2">
                            {column.format
                              ? column.format(row[column.id], row)
                              : row[column.id]}
                          </Typography>
                        </Box>
                      ))}
                  </Box>

                  {/* Show all other visible columns when expanded */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mt: 1 }}>
                      {columns
                        .filter(
                          col =>
                            visibleColumns[col.id] &&
                            (col.priority === undefined || col.priority < 4) &&
                            col.priority !== 5,
                        )
                        .map(column => (
                          <Box
                            key={column.id}
                            sx={{
                              mb: 0.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {column.label}:
                            </Typography>
                            <Typography variant="body2">
                              {column.format
                                ? column.format(row[column.id], row)
                                : row[column.id]}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </Collapse>

                  {onRowClick && (
                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                      <Button
                        size="small"
                        onClick={() => handleRowClick(row)}
                        sx={{ minWidth: '80px' }}
                      >
                        Ver detalhes
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </CardViewItem>
            );
          })}

          {pagination && (
            <PaginationContainer>
              <Pagination
                count={Math.ceil(pagination.totalRows / pagination.rowsPerPage)}
                page={pagination.page}
                onChange={(_, page) => pagination.onPageChange(page)}
                color="primary"
                size="small"
                siblingCount={0}
                boundaryCount={1}
              />
            </PaginationContainer>
          )}
        </Box>
      </Paper>
    );
  }

  // Table view for desktop/tablet
  return (
    <Paper sx={{ maxHeight, overflow: 'auto' }}>
      <SearchBar
        placeholder={searchPlaceholder || localization.searchPlaceholder}
        onSearch={handleSearch}
      />
      <TableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} {...rest}>
          <TableHead>
            <TableRow>
              {displayColumns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    fontWeight: 600,
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => handleSort(column.id)}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortConfig ? sortConfig.orderBy === column.id : false}
                      direction={
                        sortConfig && sortConfig.orderBy === column.id
                          ? sortConfig.order
                          : 'asc'
                      }
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
            {sortedRows.map((row, index) => {
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
                  {displayColumns.map(column => {
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