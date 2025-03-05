// Path: features\map\utils\mapStyles.ts
/**
 * Map styling utility functions - based on the original implementation
 */

// Helper functions for GeoJSON styling
export const isNullOrEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === "";
};

/**
 * Get color based on the field type
 */
export const getColorByFieldType = (field: string): string => {
  const colorMap: Record<string, string> = {
    'preparo': 'rgb(175,141,195)',
    'extracao': 'rgb(252,141,89)',
    'validacao': 'rgb(255,255,191)',
    'disseminacao': 'rgb(145,207,96)',
    'concluido': 'rgb(26,152,80)'
  };
  
  return colorMap[field] || '#607d8b'; // Default gray if field not found
};

/**
 * Determine styling for a GeoJSON feature based on its properties
 */
export const getFeatureStyle = (feature: any, isDarkMode: boolean): any => {
  if (!feature || !feature.properties) {
    // Default style if no properties
    return {
      fillColor: isDarkMode ? '#5A8CBA' : '#4682B4',
      weight: 0.5,
      opacity: 1,
      color: '#050505',
      fillOpacity: isDarkMode ? 0.6 : 0.8,
    };
  }

  // Extract all phase fields from properties
  const phaseFields = Object.keys(feature.properties)
    .filter(k => k.split('_')[0] === 'f')
    .sort((a, b) => +a.split('_')[1] - +b.split('_')[1])
    .map(name => name.split('_').slice(0, -2).join('_'));

  // If no phase fields, return default style
  if (phaseFields.length === 0) {
    return {
      fillColor: isDarkMode ? '#5A8CBA' : '#4682B4',
      weight: 0.5,
      opacity: 1,
      color: '#050505',
      fillOpacity: isDarkMode ? 0.6 : 0.8,
    };
  }

  // Find the active phase
  let activePhase = null;
  let isCompleted = true;
  let inProgress = false;

  for (let i = 0; i < phaseFields.length; i++) {
    const field = phaseFields[i];
    const startDateField = `${field}_data_inicio`;
    const endDateField = `${field}_data_fim`;

    const hasStarted = !isNullOrEmpty(feature.properties[startDateField]);
    const hasFinished = !isNullOrEmpty(feature.properties[endDateField]);

    if (!hasFinished) {
      isCompleted = false;
      
      if (hasStarted) {
        activePhase = field;
        inProgress = true;
        break;
      } else if (!activePhase) {
        activePhase = field;
      }
    }
  }

  // If all phases are completed
  if (isCompleted) {
    return {
      fillColor: getColorByFieldType('concluido'),
      weight: 0.5,
      opacity: 1,
      color: '#050505',
      fillOpacity: 0.8,
    };
  }

  // Extract the phase type from the field
  const phaseType = activePhase ? activePhase.split('_')[2] : 'preparo';

  return {
    fillColor: getColorByFieldType(phaseType),
    weight: inProgress ? 5 : 0.5,
    opacity: 1,
    color: inProgress ? '#FF0000' : '#050505',
    fillOpacity: 0.8,
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
      label: 'Preparo não iniciada',
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