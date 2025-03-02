// Path: utils\formatters.ts

/**
 * Formata uma data para exibição no formato brasileiro (DD/MM/YYYY)
 * @param dateString String de data ou objeto Date
 * @returns String formatada ou string vazia se inválida
 */
export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '';

  try {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formata iniciais de um nome (ex: "John Doe" -> "JD")
 * @param name Nome completo
 * @returns Iniciais ou string vazia se inválido
 */
export const formatInitials = (name?: string | null): string => {
  if (!name) return '';

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
