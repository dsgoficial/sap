// Path: features\map\components\FeaturePopup.tsx
import React from 'react';
import {
  Box,
  Popover,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  useTheme,
} from '@mui/material';
import { formatDate } from '@/utils/formatters';

interface FeaturePopupProps {
  selectedFeature: any;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

// Format field name for properties
const formatFieldName = (key: string): string => {
  switch (key) {
    case 'mi':
      return 'MI';
    case 'inom':
      return 'INOM';
    case 'nome':
      return 'Nome';
    case 'tipo_produto':
      return 'Tipo de Produto';
    case 'denominador_escala':
      return 'Escala (1:)';
    case 'f_1_preparo_data_inicio':
      return 'Início Preparo';
    case 'f_1_preparo_data_fim':
      return 'Fim Preparo';
    case 'f_2_extracao_data_inicio':
      return 'Início Extração';
    case 'f_2_extracao_data_fim':
      return 'Fim Extração';
    case 'f_3_validacao_data_inicio':
      return 'Início Validação';
    case 'f_3_validacao_data_fim':
      return 'Fim Validação';
    case 'f_4_disseminacao_data_inicio':
      return 'Início Disseminação';
    case 'f_4_disseminacao_data_fim':
      return 'Fim Disseminação';
    default:
      return key;
  }
};

// Format property value
const formatPropertyValue = (key: string, value: any): string => {
  // Handle all forms of empty/null values consistently
  if (value === '-' || value === '') {
    return '-';
  }

  if (value === null || value === undefined) {
    return '';
  }

  // Format dates
  if (key.includes('data_inicio') || key.includes('data_fim')) {
    try {
      return formatDate(value);
    } catch (e) {
      console.warn(`Error formatting date value: ${value}`, e);
      return value.toString();
    }
  }

  // Format numbers
  if (key === 'denominador_escala' && typeof value === 'number') {
    return value.toLocaleString();
  }

  // Default string conversion with null safety
  return String(value);
};

// Filter important fields to display in popup
const filterImportantFields = (
  properties: Record<string, any>,
): Array<[string, any]> => {
  // Define the fields in the exact order we want to display them
  const importantFields = [
    'mi',
    'inom',
    'nome',
    'tipo_produto',
    'denominador_escala',
    'f_1_preparo_data_inicio',
    'f_1_preparo_data_fim',
    'f_2_extracao_data_inicio',
    'f_2_extracao_data_fim',
    'f_3_validacao_data_inicio',
    'f_3_validacao_data_fim',
    'f_4_disseminacao_data_inicio',
    'f_4_disseminacao_data_fim',
  ];

  // Return array of [key, value] pairs in the defined order
  // Always include all fields, even if they're null or missing
  return importantFields.map(field => [
    field,
    field in properties ? properties[field] : null,
  ]);
};

const FeaturePopup: React.FC<FeaturePopupProps> = ({
  selectedFeature,
  anchorEl,
  onClose,
}) => {
  const theme = useTheme();

  if (!selectedFeature) return null;

  return (
    <Popover
      open={Boolean(selectedFeature)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          p: 2,
          maxWidth: 400,
          maxHeight: 400,
          overflow: 'auto',
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Informações da Camada
        </Typography>
        <Table size="small">
          <TableBody>
            {filterImportantFields(selectedFeature).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    p: 1,
                  }}
                >
                  {formatFieldName(key)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    p: 1,
                  }}
                >
                  {formatPropertyValue(key, value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button size="small" onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default React.memo(FeaturePopup);
