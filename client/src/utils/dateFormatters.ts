// Path: utils\dateFormatters.ts
/**
 * Formata um timestamp com manipulação de fuso horário
 * @param dateString String de data para formatar
 * @returns Data formatada como string ou string vazia se inválida
 */
export const formatTimestampWithTimezone = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    // Parse the date, handling common UTC formats that might lack a timezone indicator
    let date;

    // If the dateString already has a timezone indicator, use it as is
    if (
      dateString.includes('Z') ||
      dateString.includes('+') ||
      dateString.match(/\d-\d{2}:\d{2}$/)
    ) {
      date = new Date(dateString);
    } else {
      // If it doesn't have a timezone indicator, assume it's UTC
      if (dateString.includes('T')) {
        // ISO format without timezone
        date = new Date(dateString + 'Z');
      } else if (dateString.includes(' ') && dateString.includes(':')) {
        // "YYYY-MM-DD HH:MM:SS" format
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      } else {
        // Fallback
        date = new Date(dateString);
      }
    }

    // Format using locale string to convert to user's timezone
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

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
