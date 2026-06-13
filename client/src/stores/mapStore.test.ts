import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayers, useMapActions } from './mapStore'
import type { MapLayer } from '@/types/map'

function layer(id: string, geojson: object): MapLayer {
  return { id, name: id, geojson, visible: true } as unknown as MapLayer
}

// M1 — setLayers deve detectar mudança de CONTEÚDO do geojson (nova referência),
// não apenas mudança de IDs. Antes, conteúdo novo com mesmos IDs era ignorado.
describe('mapStore.setLayers (M1)', () => {
  beforeEach(() => {
    renderHook(() => useMapActions()).result.current.setLayers([])
  })

  it('atualiza quando a referência do geojson muda mesmo com os mesmos IDs', () => {
    const { result } = renderHook(() => ({
      layers: useLayers(),
      actions: useMapActions(),
    }))

    const gj1 = { type: 'FeatureCollection', features: [] }
    const gj2 = { type: 'FeatureCollection', features: [{ id: 1 }] } // outra ref/conteúdo

    act(() => result.current.actions.setLayers([layer('lote_a', gj1)]))
    expect(result.current.layers[0].geojson).toBe(gj1)

    // Mesmo ID, geojson diferente → DEVE propagar (regressão do M1).
    act(() => result.current.actions.setLayers([layer('lote_a', gj2)]))
    expect(result.current.layers[0].geojson).toBe(gj2)
  })

  it('não troca a referência do estado quando nada mudou (evita re-render)', () => {
    const { result } = renderHook(() => ({
      layers: useLayers(),
      actions: useMapActions(),
    }))
    const gj = { type: 'FeatureCollection', features: [] }
    act(() => result.current.actions.setLayers([layer('lote_a', gj)]))
    const ref1 = result.current.layers
    // Mesmos id + mesma referência de geojson → guard impede update.
    act(() => result.current.actions.setLayers([layer('lote_a', gj)]))
    expect(result.current.layers).toBe(ref1)
  })
})
