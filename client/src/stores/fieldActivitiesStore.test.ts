import { describe, it, expect, beforeEach } from 'vitest'
import { useFieldActivitiesStore } from './fieldActivitiesStore'

const reset = () =>
  useFieldActivitiesStore.setState({
    selectedCampoId: null,
    selectedCampoNome: null,
    selectedTab: 'resumo',
    showSidebar: false,
    selectedTracks: [],
  })

describe('fieldActivitiesStore — selectedTracks (M7)', () => {
  beforeEach(reset)

  it('limpa selectedTracks ao trocar de campo', () => {
    const { actions } = useFieldActivitiesStore.getState()
    actions.setSelectedCampo('campo-1', 'Campo 1')
    actions.setSelectedTracks(['track-a', 'track-b'])
    expect(useFieldActivitiesStore.getState().selectedTracks).toHaveLength(2)

    // Trocar de campo deve zerar os tracks (não arrastar do campo anterior).
    actions.setSelectedCampo('campo-2', 'Campo 2')
    expect(useFieldActivitiesStore.getState().selectedTracks).toEqual([])
  })

  it('limpa selectedTracks ao fechar a sidebar', () => {
    const { actions } = useFieldActivitiesStore.getState()
    actions.setSelectedCampo('campo-1', 'Campo 1')
    actions.setSelectedTracks(['track-a'])
    actions.setShowSidebar(false)
    expect(useFieldActivitiesStore.getState().selectedTracks).toEqual([])
    expect(useFieldActivitiesStore.getState().showSidebar).toBe(false)
  })

  it('NÃO limpa tracks ao reselecionar o MESMO campo (no-op preserva estado)', () => {
    const { actions } = useFieldActivitiesStore.getState()
    actions.setSelectedCampo('campo-1', 'Campo 1')
    actions.setSelectedTracks(['track-a'])
    actions.setSelectedCampo('campo-1', 'Campo 1') // mesmo id+nome
    expect(useFieldActivitiesStore.getState().selectedTracks).toEqual(['track-a'])
  })

  it('não persiste selectedTracks no localStorage (sem vazar entre sessões)', () => {
    const { actions } = useFieldActivitiesStore.getState()
    actions.setSelectedTracks(['track-a'])
    // store criado sem middleware persist → nada gravado.
    expect(localStorage.getItem('field-activities-storage')).toBeNull()
  })
})
