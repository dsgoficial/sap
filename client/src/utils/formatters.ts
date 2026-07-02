// Path: utils\formatters.ts

// Strings só-data ('YYYY-MM-DD') são interpretadas como meia-noite UTC pelo
// construtor de Date, o que desloca o dia no fuso local (UTC-3 exibe o dia
// anterior). Interpreta como meia-noite LOCAL.
const parseAsLocalDate = (value: string): Date =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

/**
 * Formata uma data para exibição no formato brasileiro (DD/MM/YYYY)
 * @param dateString String de data ou objeto Date
 * @returns String formatada ou string vazia se inválida
 */
export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '';

  try {
    const date =
      typeof dateString === 'string'
        ? parseAsLocalDate(dateString)
        : dateString;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Converte uma data (ISO, 'YYYY-MM-DD' ou Date) para o valor aceito por
 * <input type="date"> ('YYYY-MM-DD') no fuso LOCAL.
 * Não usar toISOString() para isso: em UTC-3 o dia deslocaria.
 */
export const toDateInputValue = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = typeof value === 'string' ? parseAsLocalDate(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Converte o valor de um <input type="date"> ('YYYY-MM-DD') para ISO
 * preservando o dia: meia-noite LOCAL, não UTC (enviar toISOString() de
 * 'YYYY-MM-DD' cru grava 21:00 do dia anterior em UTC-3).
 */
export const dateInputToISO = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
