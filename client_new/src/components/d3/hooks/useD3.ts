// Path: components\d3\hooks\useD3.ts
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

/**
 * Custom hook for integrating D3 with React
 * @param renderFn Function that renders the D3 visualization
 * @param dependencies Array of dependencies to trigger re-render
 * @returns React ref to attach to the DOM element
 */
export const useD3 = (
  renderFn: (selection: d3.Selection<HTMLElement, unknown, null, undefined>) => void,
  dependencies: any[] = []
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      renderFn(d3.select(ref.current));
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (ref.current) {
        // Remove all event listeners
        d3.select(ref.current).selectAll('*').on('.', null);
      }
    };
  }, dependencies);
  
  return ref;
};