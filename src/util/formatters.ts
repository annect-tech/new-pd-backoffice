/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata CPF no formato 000.000.000-00
 */
export const formatCpf = (value: string): string => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
};

/**
 * Remove a máscara do CPF, retornando apenas os dígitos
 */
export const removeCpfMask = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Formata data para exibição em português
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Formata patrimônio (apenas números, máximo 6 dígitos)
 */
export const formatPatrimony = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 6);
};

