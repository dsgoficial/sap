// Path: features\rpcmtec\routes\Rpcmtec.tsx
import { ReactNode, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Table } from '@/components/ui/Table';
import { MESES } from '@/constants/meses';
import {
  getRpcmtec,
  downloadRpcmtecDocx,
  RpcmtecSap,
} from '@/services/rpcmtecService';

type Coluna = {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => ReactNode;
};

const pct = (v: number | null | undefined) =>
  v === null || v === undefined ? '-' : `${v}%`;
const txt = (v: any) => (v === null || v === undefined || v === '' ? '-' : v);

// Definição das seções, na mesma ordem do DOCX.
const SECOES: {
  titulo: string;
  chave: keyof RpcmtecSap;
  colunas: Coluna[];
  emptyMessage: string;
}[] = [
  {
    titulo: 'Estado Atual do PIT — Produção (metas 1-3)',
    chave: 'estadoPitProducao',
    emptyMessage: 'Sem lotes de produção com meta no ano',
    colunas: [
      { id: 'lote', label: 'Lote' },
      { id: 'previsto', label: 'Previsto', align: 'center' },
      { id: 'prontos_ano', label: 'Prontos (ano)', align: 'center' },
      { id: 'prontos_mes', label: 'Prontos (mês)', align: 'center' },
      { id: 'percentual', label: '%', align: 'center', format: pct },
    ],
  },
  {
    titulo: 'Estado Atual do PIT — Não-produção (metas 4-7)',
    chave: 'estadoPitNaoProducao',
    emptyMessage: 'Sem metas de não-produção no ano',
    colunas: [
      { id: 'numero_meta', label: 'Meta', align: 'center' },
      { id: 'item', label: 'Item' },
      { id: 'descricao', label: 'Descrição' },
      { id: 'previsto', label: 'Previsto', align: 'center' },
      { id: 'realizado_ano', label: 'Realizado (ano)', align: 'center' },
      { id: 'realizado_mes', label: 'Realizado (mês)', align: 'center' },
      { id: 'percentual', label: '%', align: 'center', format: pct },
    ],
  },
  {
    titulo: '2.1 Execução por Lote de Produção',
    chave: 'execucaoLote',
    emptyMessage: 'Sem blocos com atividade finalizada no mês',
    colunas: [
      { id: 'bloco', label: 'Lote SAP' },
      { id: 'num_produtos', label: 'Nº de produtos', align: 'center' },
      { id: 'num_operadores', label: 'Nº de operadores', align: 'center' },
      { id: 'percentual', label: '% concluído', align: 'center', format: pct },
    ],
  },
  {
    titulo: '2.2 Entregas de Produtos Finais',
    chave: 'entregas',
    emptyMessage: 'Sem produtos finalizados no mês',
    colunas: [
      { id: 'tipo', label: 'Tipo produto' },
      { id: 'escala', label: 'Escala', align: 'center' },
      { id: 'uuid', label: 'UUID', align: 'center' },
      { id: 'identificador', label: 'Identificador', align: 'center' },
      { id: 'lote', label: 'Lote SAP' },
    ],
  },
  {
    titulo: '2.3 Atividades de Campo',
    chave: 'campo',
    emptyMessage: 'Sem atividades de campo no mês',
    colunas: [
      { id: 'local', label: 'Local' },
      { id: 'data', label: 'Data', align: 'center' },
      { id: 'finalidade', label: 'Finalidade' },
      { id: 'efetivo', label: 'Efetivo', format: txt },
    ],
  },
  {
    titulo: '2.5 Capacitações Externas',
    chave: 'capacitacaoMinistrada',
    emptyMessage: 'Sem capacitações ministradas no mês',
    colunas: [
      { id: 'capacitacao', label: 'Capacitação' },
      { id: 'periodo', label: 'Período', align: 'center' },
      { id: 'instituicoes', label: 'Instituições', format: txt },
      {
        id: 'efetivo_capacitado',
        label: 'Efetivo capacitado',
        align: 'center',
        format: txt,
      },
    ],
  },
  {
    titulo: '2.6 Extra-PIT',
    chave: 'extraPit',
    emptyMessage: 'Sem demandas Extra-PIT no ano',
    colunas: [
      { id: 'demandante', label: 'Demandante' },
      { id: 'tipo_produto', label: 'Tipo de produto' },
      { id: 'quantidade', label: 'Qtd', align: 'center' },
      { id: 'situacao', label: 'Situação', align: 'center' },
      { id: 'data_entrega', label: 'Data de entrega', align: 'center', format: txt },
      { id: 'documento_autorizacao', label: 'Documento autorização', format: txt },
      { id: 'descricao', label: 'Descrição', format: txt },
    ],
  },
  {
    titulo: '5.1 Aproveitamento do Efetivo',
    chave: 'aproveitamento',
    emptyMessage: 'Sem efetivo lançado no mês',
    colunas: [
      { id: 'militar', label: 'Militar' },
      { id: 'atividades', label: 'Atividades', format: txt },
    ],
  },
  {
    titulo: '5.2 Capacitação do Efetivo',
    chave: 'capacitacaoRecebida',
    emptyMessage: 'Sem capacitações recebidas no mês',
    colunas: [
      { id: 'plano_codigo', label: 'Plano / Código', format: txt },
      { id: 'capacitacao', label: 'Capacitação' },
      { id: 'instituicao', label: 'Instituição', format: txt },
      { id: 'militar', label: 'Militar', format: txt },
    ],
  },
  {
    titulo: 'Total de Capacitação',
    chave: 'totalCapacitacao',
    emptyMessage: 'Sem dados de capacitação',
    colunas: [
      { id: 'indicador', label: 'Indicador' },
      { id: 'mes', label: 'Total no mês', align: 'center' },
      { id: 'ano', label: 'Total no ano', align: 'center' },
    ],
  },
  {
    titulo: 'Totais do Mês e do Ano',
    chave: 'totais',
    emptyMessage: 'Sem totais',
    colunas: [
      { id: 'indicador', label: 'Indicador' },
      { id: 'mes', label: 'Total no mês', align: 'center' },
      { id: 'ano', label: 'Total no ano', align: 'center' },
    ],
  },
];

export const Rpcmtec = () => {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [baixando, setBaixando] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rpcmtec', ano, mes],
    queryFn: () => getRpcmtec(ano, mes),
  });

  const handleDownload = async () => {
    setBaixando(true);
    try {
      await downloadRpcmtecDocx(ano, mes);
      enqueueSnackbar('Download do RPCMTec iniciado', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erro ao gerar o RPCMTec', { variant: 'error' });
    } finally {
      setBaixando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        RPCMTec — Seção Produção e Pessoal
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          select
          label="Mês"
          size="small"
          value={mes}
          onChange={e => setMes(Number(e.target.value))}
          sx={{ minWidth: 160 }}
        >
          {MESES.map((nome, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Ano"
          type="number"
          size="small"
          value={ano}
          onChange={e => setAno(Number(e.target.value))}
          sx={{ width: 120 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handleDownload}
          disabled={baixando || isLoading}
        >
          Baixar DOCX
        </Button>
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Erro ao carregar o RPCMTec.</Alert>
      )}

      {data &&
        !isLoading &&
        SECOES.map(secao => (
          <Box key={secao.chave as string} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {secao.titulo}
            </Typography>
            <Table
              columns={secao.colunas}
              rows={(data[secao.chave] as Record<string, any>[]) || []}
              emptyMessage={secao.emptyMessage}
            />
          </Box>
        ))}
    </Box>
  );
};
