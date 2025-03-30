// Path: features\dashboard\components\ProductionCharts.tsx
import { useMemo, useState, useRef } from 'react';
import {
  Grid,
  Box,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Popover,
  Paper,
} from '@mui/material';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { DashboardData } from '@/types/dashboard';
import FilterListIcon from '@mui/icons-material/FilterList';

interface ProductionChartsProps {
  data?: DashboardData;
  isLoading: boolean;
}

// Interfaces para definir corretamente os tipos
interface ChartSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface ChartSeriesWithLotKeys extends ChartSeries {
  lotKeys: string[];
}

type MonthlyChartSeries = ChartSeries | ChartSeriesWithLotKeys;

// Função para verificar se série tem lotKeys
function hasLotKeys(
  series: MonthlyChartSeries,
): series is ChartSeriesWithLotKeys {
  return 'lotKeys' in series;
}

const PAGE_SIZE = 10; // Número de lotes por página
const TOP_LOTS_DEFAULT = 5; // Número padrão de principais lotes a mostrar

export const ProductionCharts = ({
  data,
  isLoading,
}: ProductionChartsProps) => {
  // Referência para o botão de filtros
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Estados para filtros e ordenação
  const [filterAnchorEl, setFilterAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [topLotsCount, setTopLotsCount] = useState(TOP_LOTS_DEFAULT);
  const [groupOthers, setGroupOthers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activitiesPage, setActivitiesPage] = useState(1);

  // Controle do popover de filtros
  const handleOpenFilters = () => {
    if (filterButtonRef.current) {
      setFilterAnchorEl(filterButtonRef.current);
    }
  };

  const handleCloseFilters = () => {
    setFilterAnchorEl(null);
  };

  const isFiltersOpen = Boolean(filterAnchorEl);

  // Dados do gráfico de pizza (Status dos produtos)
  const pieData = useMemo(() => {
    if (!data) return [];

    const completed = Math.max(0, data.summary.completedProducts);
    const running = Math.max(0, data.summary.runningProducts);
    const notStarted = Math.max(
      0,
      data.summary.totalProducts - (completed + running),
    );

    return [
      {
        label: 'Finalizados',
        value: completed,
        color: '#7A9D54',
      },
      {
        label: 'Não Iniciado',
        value: notStarted,
        color: '#F24C3D',
      },
      {
        label: 'Em Execução',
        value: running,
        color: '#4FC0D0',
      },
    ];
  }, [data]);

  // Format bar chart series
  const barSeries = [
    { dataKey: 'completed', name: 'Finalizados', color: '#7A9D54' },
    { dataKey: 'running', name: 'Em Execução', color: '#4FC0D0' },
    { dataKey: 'notStarted', name: 'Não Iniciado', color: '#F24C3D' },
  ];

  // Dados mensais processados com filtros e agrupamentos
  const monthlyChartSeries = useMemo(() => {
    if (!data || !data.monthlyData[0]) return [] as MonthlyChartSeries[];

    // Encontrar chaves que começam com lot_
    const lotKeys = Object.keys(data.monthlyData[0]).filter(key =>
      key.startsWith('lot_'),
    );

    // Filtrar lotes com base no termo de busca
    const filteredLotKeys = lotKeys.filter(key => {
      const lotName = key.replace('lot_', '');
      return lotName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Determinar valor total para cada lote para ordenação
    const lotValues = filteredLotKeys.map(key => {
      const totalValue = data.monthlyData.reduce((sum, month) => {
        return sum + (typeof month[key] === 'number' ? month[key] : 0);
      }, 0);

      return {
        key,
        name: key.replace('lot_', 'Lote '),
        value: totalValue,
      };
    });

    // Ordenar lotes pelo valor total (decrescente)
    const sortedLots = [...lotValues].sort((a, b) => b.value - a.value);

    // Cores para cada série
    const colors = [
      '#8884d8',
      '#83a6ed',
      '#8dd1e1',
      '#82ca9d',
      '#a4de6c',
      '#d0ed57',
      '#ffc658',
      '#ff8042',
      '#ff6361',
      '#bc5090',
    ];

    // Se agrupar os demais lotes além dos principais
    if (groupOthers && sortedLots.length > topLotsCount) {
      const topLots = sortedLots.slice(0, topLotsCount);

      // Criar série para cada top lote
      const topLotSeries: ChartSeries[] = topLots.map((lot, index) => ({
        dataKey: lot.key,
        name: lot.name,
        color: colors[index % colors.length],
      }));

      // Criar uma série "Outros" para os lotes restantes
      const otherLotKeys = sortedLots.slice(topLotsCount).map(lot => lot.key);

      // Adicionar série "Outros" apenas se há lotes para agrupar
      if (otherLotKeys.length > 0) {
        const othersSeries: ChartSeriesWithLotKeys = {
          dataKey: 'others',
          name: `Outros (${otherLotKeys.length} lotes)`,
          color: '#919EAB',
          lotKeys: otherLotKeys, // Armazenar as chaves originais para cálculos
        };

        return [...topLotSeries, othersSeries] as MonthlyChartSeries[];
      }

      return topLotSeries as MonthlyChartSeries[];
    } else {
      // Se não agrupar ou tiver menos lotes que topLotsCount, mostrar todos
      const displayLots = sortedLots.slice(0, sortedLots.length);

      return displayLots.map((lot, index) => ({
        dataKey: lot.key,
        name: lot.name,
        color: colors[index % colors.length],
      })) as MonthlyChartSeries[];
    }
  }, [data, topLotsCount, groupOthers, searchTerm]);

  // Filtra dados mensais para mostrar apenas até o mês atual
  // Adiciona processamento para a categoria "Outros" se necessário
  const filteredMonthlyData = useMemo(() => {
    if (!data) return [];

    const currentMonth = new Date().getMonth(); // 0-based index
    const baseData = data.monthlyData
      .filter((_, index) => index <= currentMonth)
      .map(monthData => {
        const newMonthData: { [key: string]: string | number } = {
          month: monthData.month,
        };

        // Copiar valores normais
        Object.keys(monthData).forEach(key => {
          if (key !== 'month' && key in monthData) {
            newMonthData[key] =
              typeof monthData[key] === 'string'
                ? Number(monthData[key])
                : monthData[key];
          }
        });

        // Processar categoria "Outros" se necessário
        const othersSeries = monthlyChartSeries.find(
          s => s.dataKey === 'others',
        );
        if (othersSeries && hasLotKeys(othersSeries)) {
          const othersSum = othersSeries.lotKeys.reduce(
            (sum: number, key: string) => {
              return (
                sum + (typeof monthData[key] === 'number' ? monthData[key] : 0)
              );
            },
            0,
          );
          newMonthData['others'] = othersSum;
        }

        return newMonthData;
      });

    return baseData;
  }, [data, monthlyChartSeries]);

  // Processa e pagina os dados de atividades por lote com ordenação fixa
  const paginatedLotProgressData = useMemo(() => {
    if (!data || !data.lotProgressData) return [];

    // Filtra por termo de busca
    const filteredData = data.lotProgressData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Nova lógica de ordenação fixa seguindo a prioridade solicitada:
    // 1. Quantidade de finalizados (decrescente)
    // 2. Quantidade de em execução (decrescente)
    // 3. Quantidade de não iniciado (decrescente)
    const sortedData = [...filteredData].sort((a, b) => {
      // Primeiro ordenar por finalizados (decrescente)
      if (a.completed !== b.completed) {
        return b.completed - a.completed;
      }

      // Em caso de empate, ordenar por em execução (decrescente)
      if (a.running !== b.running) {
        return b.running - a.running;
      }

      // Por último, ordenar por não iniciado (decrescente)
      return b.notStarted - a.notStarted;
    });

    // Calcula índices para paginação
    const startIndex = (activitiesPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return sortedData.slice(startIndex, endIndex);
  }, [data, activitiesPage, searchTerm]);

  // Calcula o número total de páginas para a paginação
  const totalPages = useMemo(() => {
    if (!data || !data.lotProgressData) return 1;

    const filteredCount = data.lotProgressData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ).length;

    return Math.ceil(filteredCount / PAGE_SIZE);
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    );
  }

  if (!data) {
    return <Box>No data available</Box>;
  }

  return (
    <Grid container spacing={3}>
      {/* Produtos Por Mês em uma linha sozinho */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <Tooltip title="Filtros e opções">
              <IconButton
                ref={filterButtonRef}
                size="small"
                onClick={handleOpenFilters}
                sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Popover para os filtros - não interfere no layout do dashboard */}
          <Popover
            open={isFiltersOpen}
            anchorEl={filterAnchorEl}
            onClose={handleCloseFilters}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Paper sx={{ p: 3, width: 300, maxWidth: '90vw' }}>
              <Typography variant="subtitle1" gutterBottom>
                Opções de visualização
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Buscar lote"
                  size="small"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  fullWidth
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Top Lotes</InputLabel>
                  <Select
                    value={topLotsCount}
                    label="Top Lotes"
                    onChange={e => setTopLotsCount(Number(e.target.value))}
                  >
                    <MenuItem value={3}>Top 3</MenuItem>
                    <MenuItem value={5}>Top 5</MenuItem>
                    <MenuItem value={10}>Top 10</MenuItem>
                    <MenuItem value={9999}>Todos</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={groupOthers}
                      onChange={e => setGroupOthers(e.target.checked)}
                    />
                  }
                  label="Agrupar outros lotes"
                />
              </Stack>
            </Paper>
          </Popover>

          <BarChart
            title="Produtos Por Mês"
            data={filteredMonthlyData}
            series={monthlyChartSeries}
            xAxisDataKey="month"
            height={300}
            stacked
          />
        </Box>
      </Grid>

      {/* Status dos Produtos - agora ocupando linha inteira */}
      <Grid item xs={12}>
        <PieChart
          title="Status dos Produtos"
          data={pieData}
          height={300}
          showLegend={true}
        />
      </Grid>

      {/* Atividades Por Lote */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative' }}>
          <StackedBarChart
            title="Atividades Por Lote"
            data={paginatedLotProgressData}
            series={barSeries}
            height={400}
            stacked100
          />

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={activitiesPage}
                onChange={(_, page) => setActivitiesPage(page)}
                color="primary"
              />
            </Box>
          )}

          {searchTerm && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Filtrando por: "{searchTerm}" • {paginatedLotProgressData.length}{' '}
              lotes encontrados
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};
