// Path: features\map\utils\mapStyles.ts
/**
 * Map styling utility functions for maplibre-gl
 */
// Define our own types to match what maplibre-gl expects
interface FillLayerPaint {
  'fill-antialias'?: boolean;
  'fill-opacity'?: number;
  'fill-color'?: any;
  'fill-outline-color'?: any;
  'fill-translate'?: [number, number];
  'fill-translate-anchor'?: 'map' | 'viewport';
  'fill-pattern'?: string;
}

interface LineLayerPaint {
  'line-opacity'?: number;
  'line-color'?: any;
  'line-translate'?: [number, number];
  'line-translate-anchor'?: 'map' | 'viewport';
  'line-width'?: any;
  'line-gap-width'?: any;
  'line-offset'?: any;
  'line-blur'?: any;
  'line-dasharray'?: number[];
  'line-pattern'?: string;
  'line-gradient'?: any;
}

// Helper functions for GeoJSON styling
export const isNullOrEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === '' || value === '-';
};

/**
 * Check if a phase is skipped (both start and end dates are "-")
 */
export const isPhaseSkipped = (
  properties: any,
  startKey: string,
  endKey: string,
): boolean => {
  return properties[startKey] === '-' && properties[endKey] === '-';
};

/**
 * Check if a phase is complete (has both valid start and end dates that are not "-")
 */
export const isPhaseComplete = (
  properties: any,
  startKey: string,
  endKey: string,
): boolean => {
  // If the phase is skipped, consider it "complete" for the purpose of overall completion check
  if (isPhaseSkipped(properties, startKey, endKey)) {
    return true;
  }

  // Otherwise, phase is complete if both start and end dates exist and are not "-" or null
  return (
    properties[startKey] !== null &&
    properties[startKey] !== undefined &&
    properties[startKey] !== '-' &&
    properties[endKey] !== null &&
    properties[endKey] !== undefined &&
    properties[endKey] !== '-'
  );
};

/**
 * Check if a phase is in progress (has start date but no end date)
 */
export const isPhaseInProgress = (
  properties: any,
  startKey: string,
  endKey: string,
): boolean => {
  // If phase is skipped, it's not in progress
  if (isPhaseSkipped(properties, startKey, endKey)) {
    return false;
  }

  // Phase is in progress if start date exists and is not "-" or null,
  // but end date is null, missing, or "-"
  return (
    properties[startKey] !== null &&
    properties[startKey] !== undefined &&
    properties[startKey] !== '-' &&
    (properties[endKey] === null ||
      properties[endKey] === undefined ||
      properties[endKey] === '-')
  );
};

/**
 * Get color based on the field type
 */
export const getColorByFieldType = (field: string): string => {
  const colorMap: Record<string, string> = {
    preparo: 'rgb(175,141,195)', // Purple
    extracao: 'rgb(252,141,89)', // Orange
    validacao: 'rgb(255,255,191)', // Yellow
    disseminacao: 'rgb(145,207,96)', // Light green
    concluido: 'rgb(26,152,80)', // Dark green
    default: '#607d8b', // Default gray
  };

  return colorMap[field] || colorMap.default;
};

/**
 * Generate fill layer paint property based on isDarkMode
 * Handles all types of empty values: null, "-", and missing properties
 * Now properly treats "-" values as skipped phases
 */
export const getFillLayerPaint = (
  isDarkMode: boolean,
  isVisible: boolean,
): FillLayerPaint => {
  return {
    'fill-color': [
      'case',
      // COMPLETED CHECK: Check if all non-skipped phases are completed
      [
        'all',
        // Preparo: either skipped or completed
        [
          'any',
          // Skipped
          [
            'all',
            ['==', ['get', 'f_1_preparo_data_inicio'], '-'],
            ['==', ['get', 'f_1_preparo_data_fim'], '-'],
          ],
          // Completed
          [
            'all',
            ['has', 'f_1_preparo_data_inicio'],
            ['has', 'f_1_preparo_data_fim'],
            ['!=', ['get', 'f_1_preparo_data_inicio'], '-'],
            ['!=', ['get', 'f_1_preparo_data_fim'], '-'],
            ['!=', ['get', 'f_1_preparo_data_inicio'], null],
            ['!=', ['get', 'f_1_preparo_data_fim'], null],
          ],
        ],

        // Extração: either skipped or completed
        [
          'any',
          // Skipped
          [
            'all',
            ['==', ['get', 'f_2_extracao_data_inicio'], '-'],
            ['==', ['get', 'f_2_extracao_data_fim'], '-'],
          ],
          // Completed
          [
            'all',
            ['has', 'f_2_extracao_data_inicio'],
            ['has', 'f_2_extracao_data_fim'],
            ['!=', ['get', 'f_2_extracao_data_inicio'], '-'],
            ['!=', ['get', 'f_2_extracao_data_fim'], '-'],
            ['!=', ['get', 'f_2_extracao_data_inicio'], null],
            ['!=', ['get', 'f_2_extracao_data_fim'], null],
          ],
        ],

        // Validação: either skipped or completed
        [
          'any',
          // Skipped
          [
            'all',
            ['==', ['get', 'f_3_validacao_data_inicio'], '-'],
            ['==', ['get', 'f_3_validacao_data_fim'], '-'],
          ],
          // Completed
          [
            'all',
            ['has', 'f_3_validacao_data_inicio'],
            ['has', 'f_3_validacao_data_fim'],
            ['!=', ['get', 'f_3_validacao_data_inicio'], '-'],
            ['!=', ['get', 'f_3_validacao_data_fim'], '-'],
            ['!=', ['get', 'f_3_validacao_data_inicio'], null],
            ['!=', ['get', 'f_3_validacao_data_fim'], null],
          ],
        ],

        // Disseminação: either skipped or completed
        [
          'any',
          // Skipped
          [
            'all',
            ['==', ['get', 'f_4_disseminacao_data_inicio'], '-'],
            ['==', ['get', 'f_4_disseminacao_data_fim'], '-'],
          ],
          // Completed
          [
            'all',
            ['has', 'f_4_disseminacao_data_inicio'],
            ['has', 'f_4_disseminacao_data_fim'],
            ['!=', ['get', 'f_4_disseminacao_data_inicio'], '-'],
            ['!=', ['get', 'f_4_disseminacao_data_fim'], '-'],
            ['!=', ['get', 'f_4_disseminacao_data_inicio'], null],
            ['!=', ['get', 'f_4_disseminacao_data_fim'], null],
          ],
        ],

        // ADDITIONAL CHECK: Make sure at least one phase is not skipped
        // This prevents empty entries from being marked as "completed"
        [
          'any',
          ['!=', ['get', 'f_1_preparo_data_inicio'], '-'],
          ['!=', ['get', 'f_2_extracao_data_inicio'], '-'],
          ['!=', ['get', 'f_3_validacao_data_inicio'], '-'],
          ['!=', ['get', 'f_4_disseminacao_data_inicio'], '-'],
        ],
      ],
      getColorByFieldType('concluido'), // Completed (green)

      // EXTRACTION IN PROGRESS CHECK: Has start date but no end date
      [
        'all',
        ['has', 'f_2_extracao_data_inicio'],
        ['!=', ['get', 'f_2_extracao_data_inicio'], '-'],
        ['!=', ['get', 'f_2_extracao_data_inicio'], null],
        [
          'any',
          ['!', ['has', 'f_2_extracao_data_fim']],
          ['==', ['get', 'f_2_extracao_data_fim'], '-'],
          ['==', ['get', 'f_2_extracao_data_fim'], null],
        ],
      ],
      getColorByFieldType('extracao'), // Extraction in progress (orange)

      // EXTRACTION PHASE CHECK: (Skipped extraction or not started yet)
      [
        'any',
        // Not started
        [
          'all',
          ['has', 'f_2_extracao_data_inicio'],
          ['==', ['get', 'f_2_extracao_data_inicio'], null],
          ['==', ['get', 'f_2_extracao_data_fim'], null],
        ],
        // Not started (fields missing)
        [
          'all',
          ['!', ['has', 'f_2_extracao_data_inicio']],
          ['!', ['has', 'f_2_extracao_data_fim']],
        ],
        // Finished but next phase not started
        [
          'all',
          ['has', 'f_2_extracao_data_fim'],
          ['!=', ['get', 'f_2_extracao_data_fim'], '-'],
          ['!=', ['get', 'f_2_extracao_data_fim'], null],
          [
            'any',
            ['!', ['has', 'f_3_validacao_data_inicio']],
            ['==', ['get', 'f_3_validacao_data_inicio'], '-'],
            ['==', ['get', 'f_3_validacao_data_inicio'], null],
          ],
        ],
      ],
      getColorByFieldType('extracao'), // Extraction not started (orange)

      // VALIDATION IN PROGRESS CHECK: Has start date but no end date
      [
        'all',
        ['has', 'f_3_validacao_data_inicio'],
        ['!=', ['get', 'f_3_validacao_data_inicio'], '-'],
        ['!=', ['get', 'f_3_validacao_data_inicio'], null],
        [
          'any',
          ['!', ['has', 'f_3_validacao_data_fim']],
          ['==', ['get', 'f_3_validacao_data_fim'], '-'],
          ['==', ['get', 'f_3_validacao_data_fim'], null],
        ],
      ],
      getColorByFieldType('validacao'), // Validation in progress (yellow)

      // DISSEMINATION IN PROGRESS CHECK: Has start date but no end date
      [
        'all',
        ['has', 'f_4_disseminacao_data_inicio'],
        ['!=', ['get', 'f_4_disseminacao_data_inicio'], '-'],
        ['!=', ['get', 'f_4_disseminacao_data_inicio'], null],
        [
          'any',
          ['!', ['has', 'f_4_disseminacao_data_fim']],
          ['==', ['get', 'f_4_disseminacao_data_fim'], '-'],
          ['==', ['get', 'f_4_disseminacao_data_fim'], null],
        ],
      ],
      getColorByFieldType('disseminacao'), // Dissemination in progress (light green)

      // PREPARATION IN PROGRESS CHECK: Has start date but no end date
      [
        'all',
        ['has', 'f_1_preparo_data_inicio'],
        ['!=', ['get', 'f_1_preparo_data_inicio'], '-'],
        ['!=', ['get', 'f_1_preparo_data_inicio'], null],
        [
          'any',
          ['!', ['has', 'f_1_preparo_data_fim']],
          ['==', ['get', 'f_1_preparo_data_fim'], '-'],
          ['==', ['get', 'f_1_preparo_data_fim'], null],
        ],
      ],
      getColorByFieldType('preparo'), // Preparation in progress (purple)

      // Default color
      isDarkMode ? '#5A8CBA' : '#4682B4',
    ],
    'fill-opacity': isVisible ? 0.8 : 0,
  };
};

/**
 * Generate line layer paint property based on isDarkMode
 * Handles all types of empty values: null, "-", and missing properties
 */
export const getLineLayerPaint = (
  isDarkMode: boolean,
  isVisible: boolean,
): LineLayerPaint => {
  return {
    'line-color': [
      'case',
      // Any phase in progress (has start date but not end date, and not skipped)
      [
        'any',
        // Preparo in progress
        [
          'all',
          ['has', 'f_1_preparo_data_inicio'],
          ['!=', ['get', 'f_1_preparo_data_inicio'], '-'],
          ['!=', ['get', 'f_1_preparo_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_1_preparo_data_fim']],
            ['==', ['get', 'f_1_preparo_data_fim'], '-'],
            ['==', ['get', 'f_1_preparo_data_fim'], null],
          ],
          // Not skipped
          ['!=', ['get', 'f_1_preparo_data_inicio'], '-'],
          ['!=', ['get', 'f_1_preparo_data_fim'], '-'],
        ],
        // Extraction in progress
        [
          'all',
          ['has', 'f_2_extracao_data_inicio'],
          ['!=', ['get', 'f_2_extracao_data_inicio'], '-'],
          ['!=', ['get', 'f_2_extracao_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_2_extracao_data_fim']],
            ['==', ['get', 'f_2_extracao_data_fim'], '-'],
            ['==', ['get', 'f_2_extracao_data_fim'], null],
          ],
          // Not skipped
          ['!=', ['get', 'f_2_extracao_data_inicio'], '-'],
          ['!=', ['get', 'f_2_extracao_data_fim'], '-'],
        ],
        // Validation in progress
        [
          'all',
          ['has', 'f_3_validacao_data_inicio'],
          ['!=', ['get', 'f_3_validacao_data_inicio'], '-'],
          ['!=', ['get', 'f_3_validacao_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_3_validacao_data_fim']],
            ['==', ['get', 'f_3_validacao_data_fim'], '-'],
            ['==', ['get', 'f_3_validacao_data_fim'], null],
          ],
          // Not skipped
          ['!=', ['get', 'f_3_validacao_data_inicio'], '-'],
          ['!=', ['get', 'f_3_validacao_data_fim'], '-'],
        ],
        // Dissemination in progress
        [
          'all',
          ['has', 'f_4_disseminacao_data_inicio'],
          ['!=', ['get', 'f_4_disseminacao_data_inicio'], '-'],
          ['!=', ['get', 'f_4_disseminacao_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_4_disseminacao_data_fim']],
            ['==', ['get', 'f_4_disseminacao_data_fim'], '-'],
            ['==', ['get', 'f_4_disseminacao_data_fim'], null],
          ],
          // Not skipped
          ['!=', ['get', 'f_4_disseminacao_data_inicio'], '-'],
          ['!=', ['get', 'f_4_disseminacao_data_fim'], '-'],
        ],
      ],
      '#FF0000', // Red for in progress
      // Use the isDarkMode parameter to choose appropriate color
      isDarkMode ? '#333333' : '#050505', // Default line color
    ],
    'line-width': [
      'case',
      [
        'any',
        // Preparo in progress
        [
          'all',
          ['has', 'f_1_preparo_data_inicio'],
          ['!=', ['get', 'f_1_preparo_data_inicio'], '-'],
          ['!=', ['get', 'f_1_preparo_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_1_preparo_data_fim']],
            ['==', ['get', 'f_1_preparo_data_fim'], '-'],
            ['==', ['get', 'f_1_preparo_data_fim'], null],
          ],
        ],
        // Extraction in progress
        [
          'all',
          ['has', 'f_2_extracao_data_inicio'],
          ['!=', ['get', 'f_2_extracao_data_inicio'], '-'],
          ['!=', ['get', 'f_2_extracao_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_2_extracao_data_fim']],
            ['==', ['get', 'f_2_extracao_data_fim'], '-'],
            ['==', ['get', 'f_2_extracao_data_fim'], null],
          ],
        ],
        // Validation in progress
        [
          'all',
          ['has', 'f_3_validacao_data_inicio'],
          ['!=', ['get', 'f_3_validacao_data_inicio'], '-'],
          ['!=', ['get', 'f_3_validacao_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_3_validacao_data_fim']],
            ['==', ['get', 'f_3_validacao_data_fim'], '-'],
            ['==', ['get', 'f_3_validacao_data_fim'], null],
          ],
        ],
        // Dissemination in progress
        [
          'all',
          ['has', 'f_4_disseminacao_data_inicio'],
          ['!=', ['get', 'f_4_disseminacao_data_inicio'], '-'],
          ['!=', ['get', 'f_4_disseminacao_data_inicio'], null],
          [
            'any',
            ['!', ['has', 'f_4_disseminacao_data_fim']],
            ['==', ['get', 'f_4_disseminacao_data_fim'], '-'],
            ['==', ['get', 'f_4_disseminacao_data_fim'], null],
          ],
        ],
      ],
      2, // Thicker for in progress
      0.5, // Default width
    ],
    'line-opacity': isVisible ? 1 : 0,
  };
};

/**
 * Determine styling for a GeoJSON feature based on its properties
 * Returns paint properties for use with maplibre-gl
 */
export const getFeatureLayerPaint = (properties: any, isDarkMode: boolean) => {
  if (!properties) {
    // Default style if no properties
    return {
      fill: {
        'fill-color': isDarkMode ? '#5A8CBA' : '#4682B4',
        'fill-opacity': isDarkMode ? 0.6 : 0.8,
      },
      line: {
        'line-color': '#050505',
        'line-width': 0.5,
        'line-opacity': 1,
      },
    };
  }

  // Define phase keys for cleaner code
  const phases = [
    {
      name: 'preparo',
      startKey: 'f_1_preparo_data_inicio',
      endKey: 'f_1_preparo_data_fim',
    },
    {
      name: 'extracao',
      startKey: 'f_2_extracao_data_inicio',
      endKey: 'f_2_extracao_data_fim',
    },
    {
      name: 'validacao',
      startKey: 'f_3_validacao_data_inicio',
      endKey: 'f_3_validacao_data_fim',
    },
    {
      name: 'disseminacao',
      startKey: 'f_4_disseminacao_data_inicio',
      endKey: 'f_4_disseminacao_data_fim',
    },
  ];

  // Check if all required phases are complete (skipped or finished)
  const allPhasesComplete = phases.every(
    phase =>
      isPhaseSkipped(properties, phase.startKey, phase.endKey) ||
      isPhaseComplete(properties, phase.startKey, phase.endKey),
  );

  // Check if at least one phase is not skipped (prevent empty entries from showing as complete)
  const hasAtLeastOnePhase = phases.some(
    phase => properties[phase.startKey] !== '-',
  );

  // Determine active phase and status
  let phaseType = 'default';
  let isInProgress = false;

  if (allPhasesComplete && hasAtLeastOnePhase) {
    phaseType = 'concluido';
    isInProgress = false;
  } else {
    // Check phases in reverse order to find the latest active one
    for (let i = phases.length - 1; i >= 0; i--) {
      const phase = phases[i];

      // Skip phases marked with "-"
      if (isPhaseSkipped(properties, phase.startKey, phase.endKey)) {
        continue;
      }

      // Check if phase is in progress
      if (isPhaseInProgress(properties, phase.startKey, phase.endKey)) {
        phaseType = phase.name;
        isInProgress = true;
        break;
      }

      // Check if phase is completed but next phase not started
      if (isPhaseComplete(properties, phase.startKey, phase.endKey)) {
        // If this is the last phase or the next phase is skipped, continue checking
        if (
          i === phases.length - 1 ||
          isPhaseSkipped(
            properties,
            phases[i + 1].startKey,
            phases[i + 1].endKey,
          )
        ) {
          continue;
        }

        // If next phase is not started and not skipped, use current phase color
        if (
          !isPhaseSkipped(
            properties,
            phases[i + 1].startKey,
            phases[i + 1].endKey,
          ) &&
          isNullOrEmpty(properties[phases[i + 1].startKey])
        ) {
          phaseType = phase.name;
          isInProgress = false;
          break;
        }
      }

      // Handle special case for null values (not started)
      if (
        properties[phase.startKey] === null &&
        properties[phase.endKey] === null
      ) {
        phaseType = phase.name;
        isInProgress = false;
        break;
      }
    }
  }

  return {
    fill: {
      'fill-color': getColorByFieldType(phaseType),
      'fill-opacity': 0.8,
    },
    line: {
      'line-color': isInProgress ? '#FF0000' : '#050505',
      'line-width': isInProgress ? 2 : 0.5,
      'line-opacity': 1,
    },
  };
};

/**
 * Get legend items for map
 */
export const getLegendItems = (): {
  label: string;
  color: string;
  border: boolean;
}[] => {
  return [
    {
      label: 'Preparo não iniciado',
      color: 'rgb(175,141,195)', // preparo
      border: false,
    },
    {
      label: 'Preparo em execução',
      color: 'rgb(175,141,195)', // preparo
      border: true,
    },
    {
      label: 'Extração não iniciada',
      color: 'rgb(252,141,89)', // extracao
      border: false,
    },
    {
      label: 'Extração em execução',
      color: 'rgb(252,141,89)', // extracao
      border: true,
    },
    {
      label: 'Validação não iniciada',
      color: 'rgb(255,255,191)', // validacao
      border: false,
    },
    {
      label: 'Validação em execução',
      color: 'rgb(255,255,191)', // validacao
      border: true,
    },
    {
      label: 'Disseminação não iniciada',
      color: 'rgb(145,207,96)', // disseminacao
      border: false,
    },
    {
      label: 'Disseminação em execução',
      color: 'rgb(145,207,96)', // disseminacao
      border: true,
    },
    {
      label: 'Concluído',
      color: 'rgb(26,152,80)', // concluido
      border: false,
    },
  ];
};
