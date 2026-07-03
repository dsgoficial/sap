// Path: hooks\useFieldManagement.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  criaCampo,
  atualizaCampo,
  deletaCampo,
  getCampos,
  getSituacoes,
  getCategorias,
  getEstatisticasCampos,
  getProdutosByLote,
  getProdutosByCampoId,
  getProdutosCampoTodos,
  criaProdutosCampo,
  deletaProdutosByCampo,
  criaFotos,
  atualizaFoto,
  deletaFoto,
  atualizaTrack,
  deletaTrack,
} from '@/services/fieldActivitiesService';
import { getLotes } from '@/services/lotService';
import {
  CampoInput,
  AssociacaoInput,
  FotoInput,
  Track,
} from '@/types/fieldActivities';
import { STALE_TIMES, createQueryKey } from '@/lib/queryClient';
import { QUERY_KEYS } from './useFieldActivities';

// Query keys próprias da gerência (situações/categorias não fazem parte da
// API enxuta de useFieldActivities, mas os endpoints existem no servidor).
const SITUACOES_KEY = createQueryKey('situacoes');
const CATEGORIAS_KEY = createQueryKey('categorias');

/* ----------------------------- Reference data ----------------------------- */

/** Lista completa de campos (tabela de gerência). */
export const useCampos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPOS,
    queryFn: async () => {
      const response = await getCampos();
      return response.dados;
    },
    staleTime: STALE_TIMES.USER_DATA,
  });
};

/** Situações disponíveis (dropdown do formulário). */
export const useSituacoes = () => {
  return useQuery({
    queryKey: SITUACOES_KEY,
    queryFn: async () => {
      const response = await getSituacoes();
      return response.dados;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

/** Categorias disponíveis (dropdown do formulário). */
export const useCategorias = () => {
  return useQuery({
    queryKey: CATEGORIAS_KEY,
    queryFn: async () => {
      const response = await getCategorias();
      return response.dados;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

/**
 * Invalidate the campos list + geojson + statistics after a campo change.
 */
const useInvalidateCampos = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPOS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPOS_GEOJSON });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ESTATISTICAS });
  };
};

/* ------------------------------- Campo CRUD ------------------------------- */

export const useCreateCampo = () => {
  const invalidate = useInvalidateCampos();
  return useMutation({
    mutationFn: (campo: CampoInput) => criaCampo(campo),
    onSuccess: invalidate,
  });
};

export const useUpdateCampo = () => {
  const invalidate = useInvalidateCampos();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campo }: { id: string; campo: CampoInput }) =>
      atualizaCampo(id, campo),
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CAMPO_BY_ID(variables.id),
      });
    },
  });
};

export const useDeleteCampo = () => {
  const invalidate = useInvalidateCampos();
  return useMutation({
    mutationFn: (id: string) => deletaCampo(id),
    onSuccess: invalidate,
  });
};

/* ------------------------------ Estatísticas ------------------------------ */

export const useEstatisticasCampos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ESTATISTICAS,
    queryFn: async () => {
      const response = await getEstatisticasCampos();
      return response.dados;
    },
    staleTime: STALE_TIMES.USER_DATA,
  });
};

/* ----------------------- Produto <-> Campo associations ------------------- */

export const useLotes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.LOTES,
    queryFn: async () => {
      const response = await getLotes();
      return response.dados;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

export const useProdutosByLote = (loteId: number | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUTOS_LOTE(loteId ?? 0),
    queryFn: async () => {
      const response = await getProdutosByLote(loteId as number);
      return response.dados;
    },
    enabled: !!loteId,
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

export const useProdutosByCampo = (campoId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUTOS_CAMPO(campoId),
    queryFn: async () => {
      const response = await getProdutosByCampoId(campoId);
      return response.dados;
    },
    enabled: !!campoId,
    staleTime: STALE_TIMES.USER_DATA,
  });
};

/** Todas as associações produto x campo do sistema (tabela de análise campo x lote). */
export const useProdutosCampoTodos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUTOS_CAMPO_TODOS,
    queryFn: async () => {
      const response = await getProdutosCampoTodos();
      return response.dados;
    },
    staleTime: STALE_TIMES.USER_DATA,
  });
};

const useInvalidateProdutosCampo = () => {
  const queryClient = useQueryClient();
  return (campoId: string) => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.PRODUTOS_CAMPO(campoId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.PRODUTOS_CAMPO_TODOS,
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPOS });
  };
};

export const useCreateAssociacoes = () => {
  const invalidate = useInvalidateProdutosCampo();
  return useMutation({
    mutationFn: ({
      campoId: _campoId,
      associacoes,
    }: {
      campoId: string;
      associacoes: AssociacaoInput[];
    }) => criaProdutosCampo(associacoes),
    onSuccess: (_data, variables) => invalidate(variables.campoId),
  });
};

export const useDeleteAssociacoes = () => {
  const invalidate = useInvalidateProdutosCampo();
  return useMutation({
    mutationFn: (campoId: string) => deletaProdutosByCampo(campoId),
    onSuccess: (_data, campoId) => invalidate(campoId),
  });
};

/* --------------------------------- Fotos ---------------------------------- */

const useInvalidateFotos = () => {
  const queryClient = useQueryClient();
  return (campoId: string) => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.FOTOS_BY_CAMPO(campoId),
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPOS });
  };
};

export const useCreateFotos = () => {
  const invalidate = useInvalidateFotos();
  return useMutation({
    mutationFn: ({
      campoId: _campoId,
      fotos,
    }: {
      campoId: string;
      fotos: FotoInput[];
    }) => criaFotos(fotos),
    onSuccess: (_data, variables) => invalidate(variables.campoId),
  });
};

export const useUpdateFoto = () => {
  const invalidate = useInvalidateFotos();
  return useMutation({
    mutationFn: ({
      campoId: _campoId,
      fotoId,
      foto,
    }: {
      campoId: string;
      fotoId: string;
      foto: { descricao?: string | null; data_imagem?: string | null };
    }) => atualizaFoto(fotoId, foto),
    onSuccess: (_data, variables) => invalidate(variables.campoId),
  });
};

export const useDeleteFoto = () => {
  const invalidate = useInvalidateFotos();
  return useMutation({
    mutationFn: ({ fotoId }: { campoId: string; fotoId: string }) =>
      deletaFoto(fotoId),
    onSuccess: (_data, variables) => invalidate(variables.campoId),
  });
};

/* --------------------------------- Tracks --------------------------------- */

const useInvalidateTracks = () => {
  const queryClient = useQueryClient();
  return (campoId: string) => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.TRACKS_BY_CAMPO(campoId),
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPOS });
  };
};

export const useUpdateTrack = () => {
  const invalidate = useInvalidateTracks();
  return useMutation({
    mutationFn: ({
      campoId: _campoId,
      trackId,
      track,
    }: {
      campoId: string;
      trackId: string;
      track: Partial<Track>;
    }) => atualizaTrack(trackId, track),
    onSuccess: (_data, variables) => invalidate(variables.campoId),
  });
};

export const useDeleteTrack = () => {
  const invalidate = useInvalidateTracks();
  return useMutation({
    mutationFn: ({ trackId }: { campoId: string; trackId: string }) =>
      deletaTrack(trackId),
    onSuccess: (_data, variables) => invalidate(variables.campoId),
  });
};
