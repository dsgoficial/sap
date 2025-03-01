// Path: utils\validation.ts
import { z } from 'zod';

/**
 * Validações comuns
 */

// Email
export const emailSchema = z.string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório');

// Senha
export const passwordSchema = z.string()
  .min(6, 'Senha deve ter no mínimo 6 caracteres');

// Nome
export const nameSchema = z.string()
  .min(3, 'Nome deve ter no mínimo 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres');

// Descrição
export const descriptionSchema = z.string()
  .min(5, 'Descrição deve ter no mínimo 5 caracteres')
  .max(500, 'Descrição deve ter no máximo 500 caracteres');

// Número
export const numberSchema = z.number()
  .min(0, 'Número deve ser maior ou igual a zero');

// Data
export const dateSchema = z.string()
  .refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, { message: 'Data inválida' });

/**
 * Esquemas de validação para formulários específicos
 */

// Login
export const loginSchema = z.object({
  usuario: z.string().min(1, 'Usuário é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Relatório de erro
export const errorReportSchema = z.object({
  tipo_problema_id: z.number({
    required_error: 'Escolha o tipo de problema',
    invalid_type_error: 'Escolha o tipo de problema',
  }),
  descricao: descriptionSchema,
});

export type ErrorReportFormValues = z.infer<typeof errorReportSchema>;

/**
 * Funções de validação auxiliares
 */

/**
 * Valida se uma string é uma URL válida
 * @param url URL a ser validada
 * @returns boolean
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Valida se um valor é um número
 * @param value Valor a ser validado
 * @returns boolean
 */
export const isNumber = (value: unknown): boolean => {
  return !isNaN(Number(value));
};

/**
 * Valida se um CPF é válido
 * @param cpf CPF a ser validado
 * @returns boolean
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida se uma data é válida
 * @param dateString String de data
 * @returns boolean
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};