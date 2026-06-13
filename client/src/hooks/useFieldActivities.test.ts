import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { createHookWrapper } from '@/test/utils/render'
import { useFieldActivities } from './useFieldActivities'
import { useFieldActivitiesStore } from '@/stores/fieldActivitiesStore'

// Features com 3 casos de borda deliberados:
//  - c1: feature normal (id + nome)
//  - c2: nome null (selecionável, mas sem nome para exibir)
//  - sem id: properties null — não pode quebrar o find por id
const FEATURES = [
  { type: 'Feature', properties: { id: 'c1', nome: 'Campo Um' }, geometry: { type: 'Point', coordinates: [0, 0] } },
  { type: 'Feature', properties: { id: 'c2', nome: null }, geometry: { type: 'Point', coordinates: [1, 1] } },
  { type: 'Feature', properties: null, geometry: { type: 'Point', coordinates: [2, 2] } },
]

// O backend devolve { success, message, dados: <geojson> }. O serviço embrulha o
// corpo inteiro em `dados`, então o hook lê response.dados.dados = <geojson>.
function mockGeoJSON(dados: unknown) {
  server.use(
    http.get('*/campo/campos-geojson', () =>
      HttpResponse.json({ success: true, message: 'ok', dados }),
    ),
  )
}

function resetStore() {
  useFieldActivitiesStore.setState({
    selectedCampoId: null,
    selectedCampoNome: null,
    selectedTab: 'resumo',
    showSidebar: false,
    selectedTracks: [],
  })
}

function renderFieldActivities() {
  return renderHook(() => useFieldActivities(), { wrapper: createHookWrapper() })
}

beforeEach(() => {
  resetStore()
})

describe('useFieldActivities — carga do geojson', () => {
  it('força o type para FeatureCollection mesmo se o backend mandar outro', async () => {
    // O backend manda type errado de propósito; o hook deve corrigir.
    mockGeoJSON({ type: 'AlgoErrado', features: FEATURES })
    const { result } = renderFieldActivities()

    await waitFor(() => expect(result.current.isLoadingGeoJson).toBe(false))

    expect(result.current.geoJsonData?.type).toBe('FeatureCollection')
    expect(result.current.geoJsonData?.features).toHaveLength(3)
    expect(result.current.error).toBeNull()
  })

  it('quando dados é null devolve geoJsonData null (sem quebrar)', async () => {
    mockGeoJSON(null)
    const { result } = renderFieldActivities()

    await waitFor(() => expect(result.current.isLoadingGeoJson).toBe(false))

    expect(result.current.geoJsonData).toBeNull()
  })
})

describe('useFieldActivities — handleSelectCampo', () => {
  it('encontra o nome do campo pelo id e abre a sidebar', async () => {
    mockGeoJSON({ type: 'FeatureCollection', features: FEATURES })
    const { result } = renderFieldActivities()
    await waitFor(() => expect(result.current.isLoadingGeoJson).toBe(false))

    act(() => result.current.handleSelectCampo('c1'))

    expect(result.current.selectedCampoId).toBe('c1')
    expect(useFieldActivitiesStore.getState().selectedCampoNome).toBe('Campo Um')
    expect(useFieldActivitiesStore.getState().showSidebar).toBe(true)
  })

  it('campo com nome null seleciona o id mas mantém o nome null', async () => {
    mockGeoJSON({ type: 'FeatureCollection', features: FEATURES })
    const { result } = renderFieldActivities()
    await waitFor(() => expect(result.current.isLoadingGeoJson).toBe(false))

    act(() => result.current.handleSelectCampo('c2'))

    expect(result.current.selectedCampoId).toBe('c2')
    expect(useFieldActivitiesStore.getState().selectedCampoNome).toBeNull()
  })

  it('id inexistente seleciona mesmo assim com nome null e não quebra com features de properties null', async () => {
    mockGeoJSON({ type: 'FeatureCollection', features: FEATURES })
    const { result } = renderFieldActivities()
    await waitFor(() => expect(result.current.isLoadingGeoJson).toBe(false))

    act(() => result.current.handleSelectCampo('nao-existe'))

    expect(result.current.selectedCampoId).toBe('nao-existe')
    expect(useFieldActivitiesStore.getState().selectedCampoNome).toBeNull()
  })
})

describe('useFieldActivities — handleViewFotos', () => {
  it('seleciona o campo, troca para a aba fotos e abre a sidebar', async () => {
    mockGeoJSON({ type: 'FeatureCollection', features: FEATURES })
    const { result } = renderFieldActivities()
    await waitFor(() => expect(result.current.isLoadingGeoJson).toBe(false))

    act(() => result.current.handleViewFotos('c1', 'Campo Um'))

    expect(result.current.selectedCampoId).toBe('c1')
    const state = useFieldActivitiesStore.getState()
    expect(state.selectedCampoNome).toBe('Campo Um')
    expect(state.selectedTab).toBe('fotos')
    expect(state.showSidebar).toBe(true)
  })
})
