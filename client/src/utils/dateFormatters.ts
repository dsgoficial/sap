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
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Só data (sem hora): dia local, sem conversão de fuso — o construtor
        // de Date trataria como meia-noite UTC e exibiria o dia anterior.
        date = new Date(dateString + 'T00:00:00');
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
 * Formata um timestamp (com segundos) tratando fusos horários.
 * Fonte única usada pelos grids (antes duplicada em Grid.tsx e GridCard.tsx).
 * @param dateString String de data para formatar
 * @returns Data formatada como string ou string vazia se inválida
 */
export const formatTimestamp = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    let date;

    if (
      dateString.includes('Z') ||
      dateString.includes('+') ||
      dateString.match(/\d-\d{2}:\d{2}$/)
    ) {
      date = new Date(dateString);
    } else if (dateString.includes('T')) {
      date = new Date(dateString + 'Z');
    } else if (dateString.includes(' ') && dateString.includes(':')) {
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Só data (sem hora): dia local, sem conversão de fuso — o construtor
      // de Date trataria como meia-noite UTC e exibiria o dia anterior.
      date = new Date(dateString + 'T00:00:00');
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
