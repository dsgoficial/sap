// Path: utils\chartAdapters.ts
import { 
    DashboardQuantityItem, 
    DashboardFinishedItem, 
    DashboardRunningItem, 
    PitItem,
    DashboardSummary 
  } from '../types/dashboard';
  import { SubphaseSituationItem } from '../types/subphase';
  
  // Constantes
  const MONTHS = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  
  const MONTH_LABELS = {
    'jan': 'Jan',
    'fev': 'Fev',
    'mar': 'Mar',
    'abr': 'Abr',
    'mai': 'Maio',
    'jun': 'Jun',
    'jul': 'Jul',
    'ago': 'Ago',
    'set': 'Set',
    'out': 'Out',
    'nov': 'Nov',
    'dez': 'Dez'
  };
  
  // Cores para gráficos
  export const CHART_COLORS = {
    COMPLETED: '#7A9D54',
    RUNNING: '#4FC0D0',
    NOT_STARTED: '#F24C3D',
    SERIES_COLORS: [
      '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', 
      '#a4de6c', '#d0ed57', '#ffc658', '#ff8c00'
    ]
  };
  
  /**
   * Converte dados do dashboard para formato de gráfico de pizza
   */
  export const adaptDashboardToPieChart = (summary: DashboardSummary) => {
    return [
      { 
        label: 'Finalizados', 
        value: summary.completedProducts,
        color: CHART_COLORS.COMPLETED
      },
      { 
        label: 'Não Iniciado', 
        value: summary.totalProducts - (summary.completedProducts + summary.runningProducts),
        color: CHART_COLORS.NOT_STARTED
      },
      { 
        label: 'Em Execução', 
        value: summary.runningProducts,
        color: CHART_COLORS.RUNNING
      }
    ];
  };
  
  /**
   * Converte dados brutos do dashboard para formato de resumo
   */
  export const adaptDashboardSummary = (
    quantityData: DashboardQuantityItem[],
    finishedData: DashboardFinishedItem[],
    runningData: DashboardRunningItem[]
  ): DashboardSummary => {
    const totalProducts = quantityData.reduce((sum, item) => sum + Number(item.quantidade), 0);
    const completedProducts = finishedData.reduce((sum, item) => sum + Number(item.finalizadas), 0);
    const runningProducts = runningData.reduce((sum, item) => sum + Number(item.count), 0);
    const progressPercentage = totalProducts ? (completedProducts / totalProducts) * 100 : 0;
    
    return {
      totalProducts,
      completedProducts,
      runningProducts,
      progressPercentage
    };
  };
  
  /**
   * Converte dados de lotes para gráfico de barras empilhadas
   */
  export const adaptLotsToStackedBarChart = (
    quantityData: DashboardQuantityItem[],
    finishedData: DashboardFinishedItem[],
    runningData: DashboardRunningItem[]
  ) => {
    // Ordenar lotes
    const sortedLots = [...quantityData].sort((a, b) => {
      const lotIdA = parseInt(a.lote.split('_')[1] || '0');
      const lotIdB = parseInt(b.lote.split('_')[1] || '0');
      return lotIdA - lotIdB;
    });
    
    // Preparar dados para o gráfico
    const chartData = sortedLots.map(lotItem => {
      const completed = finishedData.find(i => i.lote === lotItem.lote)?.finalizadas || 0;
      const running = runningData.find(i => i.lote === lotItem.lote)?.count || 0;
      const notStarted = lotItem.quantidade - (completed + running);
      
      return {
        name: lotItem.lote,
        completed,
        running,
        notStarted
      };
    });
    
    // Definir séries
    const series = [
      { dataKey: 'completed', name: 'Concluído', color: CHART_COLORS.COMPLETED },
      { dataKey: 'running', name: 'Em Execução', color: CHART_COLORS.RUNNING },
      { dataKey: 'notStarted', name: 'Não iniciado', color: CHART_COLORS.NOT_STARTED }
    ];
    
    return { chartData, series };
  };
  
  /**
   * Converte dados de PIT para gráfico de barras mensais
   */
  export const adaptPitToMonthlyBarChart = (pitData: PitItem[]) => {
    // Agrupar dados por mês
    const monthlyData = MONTHS.map((monthName, idx) => {
      const monthNumber = idx + 1;
      const dataForMonth: Record<string, any> = { month: monthName };
      
      // Agrupar por lote para gráfico de barras empilhadas
      const lots = new Set(pitData.map(item => item.lote));
      
      lots.forEach(lot => {
        // Filtrar dados para este lote e mês
        const lotsForMonth = pitData.filter(
          item => item.lote === lot && item.month === monthNumber
        );
        
        // Somar valores finalizados
        const total = lotsForMonth.reduce(
          (sum, item) => sum + (item.finalizadas || 0), 
          0
        );
        
        // Adicionar ao objeto do mês
        if (total > 0) {
          dataForMonth[`lot_${lot}`] = total;
        }
      });
      
      return dataForMonth;
    });
    
    // Criar séries para cada lote
    const lots = new Set(pitData.map(item => item.lote));
    const series = Array.from(lots).map((lot, index) => ({
      dataKey: `lot_${lot}`,
      name: lot,
      color: CHART_COLORS.SERIES_COLORS[index % CHART_COLORS.SERIES_COLORS.length]
    }));
    
    return { monthlyData, series };
  };
  
  /**
   * Converte dados de situação de subfase para gráfico de barras empilhadas
   */
  export const adaptSubphaseSituationToStackedBarChart = (data: SubphaseSituationItem[]) => {
    // Agrupar por bloco
    const blockGroups: Record<string, {
      title: string;
      finishedSeries: { label: string; y: number }[];
      unfinishedSeries: { label: string; y: number }[];
    }> = {};
    
    data.forEach(item => {
      if (!blockGroups[item.bloco]) {
        blockGroups[item.bloco] = {
          title: item.bloco,
          finishedSeries: [],
          unfinishedSeries: []
        };
      }
      
      // Adicionar à série finalizada
      blockGroups[item.bloco].finishedSeries.push({
        label: item.subfase,
        y: Number(item.finalizadas)
      });
      
      // Adicionar à série não finalizada
      blockGroups[item.bloco].unfinishedSeries.push({
        label: item.subfase,
        y: Number(item.nao_finalizadas || 0)
      });
    });
    
    // Converter para formato de gráfico
    const chartData = Object.values(blockGroups).map(block => {
      const data = block.finishedSeries.map((item, index) => ({
        name: item.label,
        finished: item.y,
        unfinished: block.unfinishedSeries[index]?.y || 0
      }));
      
      return {
        title: block.title,
        data,
        series: [
          { dataKey: 'finished', name: 'Finalizadas', color: CHART_COLORS.COMPLETED },
          { dataKey: 'unfinished', name: 'Não Finalizadas', color: '#7f7f7f' }
        ]
      };
    });
    
    return chartData;
  };