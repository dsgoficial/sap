// Path: utils\formatters.ts

/**
 * Formata uma data para exibição no formato brasileiro (DD/MM/YYYY)
 * @param dateString String de data ou objeto Date
 * @returns String formatada ou string vazia se inválida
 */
export const formatDate = (dateString?: string | Date | null): string => {
    if (!dateString) return '';
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  /**
   * Formata uma data com hora para exibição (DD/MM/YYYY HH:MM)
   * @param dateString String de data ou objeto Date
   * @returns String formatada ou string vazia se inválida
   */
  export const formatDateTime = (dateString?: string | Date | null): string => {
    if (!dateString) return '';
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  };
  
  /**
   * Formata um número para exibição como porcentagem
   * @param value Número a ser formatado
   * @param decimalPlaces Número de casas decimais
   * @returns String formatada ou string vazia se inválida
   */
  export const formatPercent = (value?: number | null, decimalPlaces = 2): string => {
    if (value === undefined || value === null) return '';
    
    try {
      return `${value.toFixed(decimalPlaces)}%`;
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return '';
    }
  };
  
  /**
   * Formata um número para exibição com separadores de milhar
   * @param value Número a ser formatado
   * @param decimalPlaces Número de casas decimais
   * @returns String formatada ou string vazia se inválida
   */
  export const formatNumber = (value?: number | null, decimalPlaces = 0): string => {
    if (value === undefined || value === null) return '';
    
    try {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }).format(value);
    } catch (error) {
      console.error('Error formatting number:', error);
      return '';
    }
  };
  
  /**
   * Formata uma duração em dias, horas, minutos e segundos
   * @param duration Objeto de duração com dias, horas, minutos e segundos
   * @returns String formatada
   */
  export const formatDuration = (duration?: { 
    days?: number; 
    hours?: number; 
    minutes?: number; 
    seconds?: number; 
  } | null): string => {
    if (!duration) return '';
    
    const parts = [];
    
    if (duration.days) parts.push(`${duration.days} dia${duration.days !== 1 ? 's' : ''}`);
    if (duration.hours) parts.push(`${duration.hours} hora${duration.hours !== 1 ? 's' : ''}`);
    if (duration.minutes) parts.push(`${duration.minutes} minuto${duration.minutes !== 1 ? 's' : ''}`);
    if (duration.seconds) parts.push(`${duration.seconds} segundo${duration.seconds !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : '-';
  };
  
  /**
   * Trunca um texto longo adicionando reticências
   * @param text Texto a ser truncado
   * @param maxLength Comprimento máximo
   * @returns Texto truncado
   */
  export const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  /**
   * Formata um nome para iniciais (ex: "John Doe" -> "JD")
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