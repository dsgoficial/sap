// Path: features\rpcmtec\routes\Rpcmtec.tsx
import { useState } from 'react';
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
};

// As subseções na numeração e com os cabeçalhos do documento da Divisão -- os
// MESMOS de SUBSECOES em server/src/relatorio/relatorio_ctrl.js. As células já
// chegam em texto; a tela só as coloca na coluna certa.
//
// `rodape` é a chave de uma lista de linhas de total que o modelo escreve com
// as três primeiras colunas mescladas (a 2.6). Na tela elas entram como linhas
// normais, com o rótulo na primeira coluna.
const SECOES: {
  numero: string;
  titulo: string;
  chave: keyof RpcmtecSap;
  colunas: Coluna[];
  emptyMessage: string;
  rodape?: keyof RpcmtecSap;
}[] = [
  {
    numero: '2.1',
    titulo: 'Estado Atual do PIT',
    chave: 'estadoPit',
    emptyMessage: 'Sem metas do PIT cadastradas no ano',
    colunas: [
      { id: 'meta_texto', label: 'Meta' },
      { id: 'item', label: 'Item', align: 'center' },
      { id: 'produto_servico', label: 'Produto ou serviço' },
      { id: 'quantidade', label: 'Quantidade', align: 'center' },
      { id: 'prontos_mes', label: 'Prontos no mês', align: 'center' },
      { id: 'prontos_ano', label: 'Prontos', align: 'center' },
      { id: 'previsao_termino', label: 'Previsão de término', align: 'center' },
    ],
  },
  {
    numero: '2.2',
    titulo: 'Totais do Mês e do Ano',
    chave: 'totais',
    emptyMessage: 'Sem totais',
    colunas: [
      { id: 'tipo_produto', label: 'Tipo de produto' },
      { id: 'mes', label: 'Quantidade no mês', align: 'center' },
      { id: 'ano', label: 'Quantidade no ano', align: 'center' },
    ],
  },
  {
    numero: '2.3',
    titulo: 'Execução por Lote de Produção',
    chave: 'execucaoLote',
    emptyMessage: 'Sem blocos com atividade finalizada no mês',
    colunas: [
      { id: 'lote', label: 'Lote SAP' },
      { id: 'num_produtos', label: 'Número de Produtos', align: 'center' },
      { id: 'num_operadores', label: 'Número de operadores', align: 'center' },
      { id: 'percentual', label: 'Percentual concluído', align: 'center' },
    ],
  },
  {
    numero: '2.4',
    titulo: 'Entregas detalhada de produtos finais (BDGEx, IGW, EBGeo) no mês',
    chave: 'entregas',
    emptyMessage: 'Sem produtos finalizados no mês',
    colunas: [
      { id: 'tipo', label: 'Tipo produto' },
      { id: 'escala', label: 'Escala', align: 'center' },
      { id: 'uuid', label: 'UUID BDGEx', align: 'center' },
      { id: 'identificador', label: 'Identificador', align: 'center' },
      { id: 'meta_pit', label: 'Meta PIT', align: 'center' },
      { id: 'lote', label: 'Lote SAP' },
    ],
  },
  {
    numero: '2.5',
    titulo: 'Atividades de campo',
    chave: 'campo',
    emptyMessage: 'Sem atividades de campo no mês',
    colunas: [
      { id: 'local', label: 'Local' },
      { id: 'data', label: 'Data', align: 'center' },
      { id: 'finalidade', label: 'Finalidade Campo' },
      { id: 'efetivo', label: 'Efetivo' },
    ],
  },
  {
    numero: '2.6',
    titulo: 'Capacitações externas',
    chave: 'capacitacaoMinistrada',
    rodape: 'capacitacaoMinistradaTotais',
    emptyMessage: 'Sem capacitações ministradas no mês',
    colunas: [
      { id: 'capacitacao', label: 'Capacitação' },
      { id: 'periodo', label: 'Período', align: 'center' },
      { id: 'instituicoes', label: 'Instituições participantes' },
      { id: 'efetivo_capacitado', label: 'Efetivo capacitado', align: 'center' },
    ],
  },
  {
    numero: '3.3',
    titulo: 'Extra-PIT',
    chave: 'extraPit',
    emptyMessage: 'Sem demandas Extra-PIT entregues no mês',
    colunas: [
      { id: 'demandante', label: 'Demandante' },
      { id: 'tipo_produto', label: 'Tipo de produto' },
      { id: 'quantidade', label: 'Qtd', align: 'center' },
      { id: 'situacao', label: 'Situação', align: 'center' },
      { id: 'documento_autorizacao', label: 'Documento autorização' },
      { id: 'descricao', label: 'Descrição' },
    ],
  },
  {
    numero: '6.1',
    titulo: 'Aproveitamento do efetivo',
    chave: 'aproveitamento',
    emptyMessage: 'Sem efetivo lançado no mês',
    colunas: [
      { id: 'militar', label: 'Militar' },
      { id: 'atividades', label: 'Atividades' },
    ],
  },
  {
    numero: '6.2',
    titulo: 'Capacitação do efetivo',
    chave: 'capacitacaoRecebida',
    emptyMessage: 'Sem capacitações recebidas no mês',
    colunas: [
      { id: 'plano_codigo', label: 'Plano / Código' },
      { id: 'capacitacao', label: 'Capacitação' },
      { id: 'instituicao', label: 'Instituição' },
      { id: 'militar', label: 'Militar' },
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

  // As linhas de total da 2.6 entram na mesma tabela, com o rótulo na primeira
  // coluna e o valor na última: é onde o documento as põe.
  const linhasDa = (secao: (typeof SECOES)[number], dados: RpcmtecSap) => {
    const corpo = (dados[secao.chave] as unknown as Record<string, string>[]) || [];
    if (!secao.rodape || corpo.length === 0) return corpo;
    const totais =
      (dados[secao.rodape] as unknown as { rotulo: string; valor: string }[]) || [];
    const primeira = secao.colunas[0].id;
    const ultima = secao.colunas[secao.colunas.length - 1].id;
    return [
      ...corpo,
      ...totais.map(t => ({ [primeira]: t.rotulo, [ultima]: t.valor })),
    ];
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        RPCMTec — subseções do SAP
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Numeração e formatação do documento da Divisão: cada tabela é colável na
        subseção de mesmo número. As demais subseções vêm do SCA (acervo,
        mapoteca e orçamento) ou são preenchidas à mão.
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

      {isError && <Alert severity="error">Erro ao carregar o RPCMTec.</Alert>}

      {data &&
        !isLoading &&
        SECOES.map(secao => (
          <Box key={secao.numero} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {secao.numero}. {secao.titulo}
            </Typography>
            <Table
              columns={secao.colunas}
              rows={linhasDa(secao, data)}
              emptyMessage={secao.emptyMessage}
            />
          </Box>
        ))}
    </Box>
  );
};
