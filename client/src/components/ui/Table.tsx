import {
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  ComponentType,
} from 'react';
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
  alpha,
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
  priority?: number;
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
  title?: string;
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
  borderTop: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['background-color', 'border-color'], {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
    padding: theme.spacing(1),
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['background-color', 'border-color'], {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const CardViewItem = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  marginBottom: 0,
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.standard,
  }),
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isDark
                  ? alpha(theme.palette.common.white, 0.23)
                  : alpha(theme.palette.common.black, 0.23),
              },
              '&:hover fieldset': {
                borderColor: isDark
                  ? alpha(theme.palette.common.white, 0.4)
                  : alpha(theme.palette.common.black, 0.4),
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
      </Box>
    </SearchContainer>
  );
});

// Ensure displayName is set for memoized component
SearchBar.displayName = 'SearchBar';

// Base interfaces for row components
interface TableRowItemProps<T extends Record<string, any>> {
  columns: Column<T>[];
  row: T;
  index: number;
  onClick: (row: T) => void;
  backgroundColor?: string;
}

interface MobileCardProps<T extends Record<string, any>> {
  row: T;
  columns: Column<T>[];
  rowId: string | number;
  index: number;
  isExpanded: boolean;
  toggleExpansion: (id: string | number) => void;
  onRowClick?: (row: T) => void;
  backgroundColor?: string;
  visibleColumns: Record<string, boolean>;
}

// Create type-safe factories for our memoized components
function createTableRowItem<T extends Record<string, any>>() {
  const component = memo(
    ({
      columns,
      row,
      index: _index,
      onClick,
      backgroundColor,
    }: TableRowItemProps<T>) => {
      const theme = useTheme();
      const isDark = theme.palette.mode === 'dark';

      return (
        <TableRow
          hover
          onClick={() => onClick(row)}
          sx={{
            cursor: typeof onClick === 'function' ? 'pointer' : 'default',
            backgroundColor,
            '&:nth-of-type(odd)': !backgroundColor
              ? {
                  backgroundColor: isDark
                    ? alpha(theme.palette.common.white, 0.05)
                    : alpha(theme.palette.common.black, 0.03),
                }
              : {},
            '&:last-child td, &:last-child th': { border: 0 },
            '&:hover': {
              backgroundColor: isDark
                ? alpha(theme.palette.common.white, 0.08)
                : alpha(theme.palette.common.black, 0.06),
            },
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.shortest,
            }),
          }}
        >
          {columns.map(column => {
            const value = row[column.id];
            return (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                }}
              >
                {column.format ? column.format(value, row) : value}
              </TableCell>
            );
          })}
        </TableRow>
      );
    },
  );
  component.displayName = 'TableRowItem';
  return component as ComponentType<TableRowItemProps<T>>;
}

function createMobileCard<T extends Record<string, any>>() {
  const component = memo(
    ({
      row,
      columns,
      rowId,
      index,
      isExpanded,
      toggleExpansion,
      onRowClick,
      backgroundColor,
      visibleColumns,
    }: MobileCardProps<T>) => {
      const theme = useTheme();
      const isDark = theme.palette.mode === 'dark';

      const mainColumn = useMemo(
        () => columns.find(col => col.priority === 5) || columns[0],
        [columns],
      );

      const highPriorityColumns = useMemo(
        () =>
          columns.filter(col => (col.priority || 0) >= 4 && col.priority !== 5),
        [columns],
      );

      const otherColumns = useMemo(
        () =>
          columns.filter(
            col =>
              visibleColumns[col.id] &&
              (col.priority === undefined || col.priority < 4) &&
              col.priority !== 5,
          ),
        [columns, visibleColumns],
      );

      const mainValue = useMemo(() => {
        const value = row[mainColumn.id];
        return mainColumn.format ? mainColumn.format(value, row) : value;
      }, [row, mainColumn]);

      // Calculate background color with theme awareness
      const cardBgColor = useMemo(() => {
        if (backgroundColor) return backgroundColor;
        return index % 2 === 0
          ? isDark
            ? alpha(theme.palette.common.white, 0.05)
            : alpha(theme.palette.common.black, 0.03)
          : theme.palette.background.paper;
      }, [backgroundColor, index, isDark, theme]);

      return (
        <CardViewItem
          elevation={1}
          sx={{
            bgcolor: cardBgColor,
            '&:hover': {
              boxShadow: theme.shadows[2],
              bgcolor: isDark
                ? alpha(theme.palette.common.white, 0.08)
                : alpha(theme.palette.common.black, 0.04),
            },
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
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ color: theme.palette.text.primary }}
              >
                {mainValue}
              </Typography>
              <IconButton
                size="small"
                onClick={() => toggleExpansion(rowId)}
                sx={{
                  color: theme.palette.action.active,
                  '&:hover': {
                    bgcolor: isDark
                      ? alpha(theme.palette.common.white, 0.08)
                      : alpha(theme.palette.common.black, 0.04),
                  },
                }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Always show key info (priority >= 4) */}
            <Box sx={{ mt: 1 }}>
              {highPriorityColumns.map(column => (
                <Box
                  key={column.id}
                  sx={{
                    mb: 0.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mr: 1, flexShrink: 0 }}
                  >
                    {column.label}:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      textAlign: 'right',
                      wordBreak: 'break-word',
                    }}
                  >
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
                {otherColumns.map(column => (
                  <Box
                    key={column.id}
                    sx={{
                      mb: 0.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mr: 1, flexShrink: 0 }}
                    >
                      {column.label}:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{
                        textAlign: 'right',
                        wordBreak: 'break-word',
                      }}
                    >
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
                  onClick={() => onRowClick(row)}
                  sx={{ minWidth: '80px' }}
                  variant="outlined"
                >
                  Ver detalhes
                </Button>
              </Box>
            )}
          </CardContent>
        </CardViewItem>
      );
    },
  );
  component.displayName = 'MobileCard';
  return component as ComponentType<MobileCardProps<T>>;
}

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
  title,
  ...rest
}: TableProps<T>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Create type-specific components for this instance
  const TableRowItem = useMemo(() => createTableRowItem<T>(), []);
  const MobileCard = useMemo(() => createMobileCard<T>(), []);

  // Merge custom localization with default
  const localization = useMemo(
    () => ({
      ...DEFAULT_LOCALIZATION,
      ...customLocalization,
      pagination: {
        ...DEFAULT_LOCALIZATION.pagination,
        ...(customLocalization?.pagination || {}),
      },
    }),
    [customLocalization],
  );

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
  const getRowKey = useCallback(
    (row: T, index: number): string | number => {
      if (rowKey) {
        return rowKey(row);
      }
      return index;
    },
    [rowKey],
  );

  // Column sort handler
  const handleSort = useCallback(
    (columnId: string) => {
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
    },
    [columns, sorting],
  );

  // Filter visible columns for current view
  const displayColumns = useMemo(
    () => columns.filter(column => visibleColumns[column.id]),
    [columns, visibleColumns],
  );

  // Handle pagination change - memoized
  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, page: number) => {
      if (pagination) {
        pagination.onPageChange(page);
      }
    },
    [pagination],
  );

  // Toggle row expansion for mobile view
  const toggleRowExpansion = useCallback((rowId: string | number) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId.toString()]: !prev[rowId.toString()],
    }));
  }, []);

  // Handle row click with empty fallback for when onRowClick is undefined
  const handleRowClick = useCallback(
    (row: T) => {
      if (onRowClick) {
        onRowClick(row);
      }
    },
    [onRowClick],
  );

  // Render loading state
  if (isLoading) {
    return (
      <Paper>
        <LoadingContainer>
          <CircularProgress
            sx={{ color: isDark ? 'primary.light' : 'primary.main' }}
          />
        </LoadingContainer>
      </Paper>
    );
  }

  // Render title if provided
  const renderTitle = () => {
    if (!title) return null;
    
    return (
      <TitleContainer>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center' 
          }}
        >
          {title}
        </Typography>
      </TitleContainer>
    );
  };

  // Render empty state
  if (sortedRows.length === 0) {
    return (
      <Paper
        sx={{
          transition: theme.transitions.create(
            ['background-color', 'box-shadow'],
            {
              duration: theme.transitions.duration.standard,
            },
          ),
        }}
      >
        {renderTitle()}
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
      <Paper
        sx={{
          maxHeight,
          overflow: 'auto',
          transition: theme.transitions.create(
            ['background-color', 'box-shadow'],
            {
              duration: theme.transitions.duration.standard,
            },
          ),
        }}
      >
        {renderTitle()}
        <SearchBar
          placeholder={searchPlaceholder || localization.searchPlaceholder}
          onSearch={handleSearch}
        />
        <Box sx={{ p: 2 }}>
          {sortedRows.map((row, idx) => {
            const rowId = getRowKey(row, idx);
            const isExpanded = !!expandedRows[rowId.toString()];
            const bg = rowBackgroundColor
              ? rowBackgroundColor(row, idx)
              : undefined;

            return (
              <MobileCard
                key={rowId}
                row={row}
                columns={columns}
                rowId={rowId}
                index={idx}
                isExpanded={isExpanded}
                toggleExpansion={toggleRowExpansion}
                onRowClick={onRowClick}
                backgroundColor={bg}
                visibleColumns={visibleColumns}
              />
            );
          })}

          {pagination && (
            <PaginationContainer>
              <Pagination
                count={Math.ceil(pagination.totalRows / pagination.rowsPerPage)}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="small"
                siblingCount={0}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: theme.palette.text.primary,
                    '&.Mui-selected': {
                      backgroundColor: isDark
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                      color: isDark
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                    },
                  },
                }}
              />
            </PaginationContainer>
          )}
        </Box>
      </Paper>
    );
  }

  // Table view for desktop/tablet
  return (
    <Paper
      sx={{
        maxHeight,
        overflow: 'auto',
        transition: theme.transitions.create(
          ['background-color', 'box-shadow'],
          {
            duration: theme.transitions.duration.standard,
          },
        ),
      }}
    >
      {renderTitle()}
      <SearchBar
        placeholder={searchPlaceholder || localization.searchPlaceholder}
        onSearch={handleSearch}
      />
      <TableContainer sx={{ maxHeight }}>
        <MuiTable
          stickyHeader={stickyHeader}
          {...rest}
          sx={{
            '& .MuiTableCell-root': {
              borderColor: theme.palette.divider,
            },
            ...rest.sx,
          }}
        >
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
                  sx={{
                    backgroundColor: stickyHeader
                      ? isDark
                        ? theme.palette.grey[900]
                        : theme.palette.common.white
                      : 'inherit',
                    color: theme.palette.text.primary,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={
                        sortConfig ? sortConfig.orderBy === column.id : false
                      }
                      direction={
                        sortConfig && sortConfig.orderBy === column.id
                          ? sortConfig.order
                          : 'asc'
                      }
                      sx={{
                        color: theme.palette.text.primary,
                        '&.MuiTableSortLabel-active': {
                          color: isDark
                            ? theme.palette.primary.light
                            : theme.palette.primary.main,
                        },
                        '& .MuiTableSortLabel-icon': {
                          color: isDark
                            ? `${theme.palette.primary.light} !important`
                            : undefined,
                        },
                      }}
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
              const bg = rowBackgroundColor
                ? rowBackgroundColor(row, index)
                : undefined;

              return (
                <TableRowItem
                  key={getRowKey(row, index)}
                  columns={displayColumns}
                  row={row}
                  index={index}
                  onClick={handleRowClick}
                  backgroundColor={bg}
                />
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
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="medium"
            variant="outlined"
            shape="rounded"
            aria-label="Navegação paginada"
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.palette.text.primary,
                borderColor: isDark
                  ? alpha(theme.palette.common.white, 0.23)
                  : undefined,
                '&.Mui-selected': {
                  backgroundColor: isDark
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: isDark
                    ? theme.palette.primary.light
                    : theme.palette.primary.main,
                  borderColor: isDark
                    ? theme.palette.primary.light
                    : theme.palette.primary.main,
                },
                '&:hover': {
                  backgroundColor: isDark
                    ? alpha(theme.palette.common.white, 0.08)
                    : alpha(theme.palette.common.black, 0.04),
                },
              },
            }}
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