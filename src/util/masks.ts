/**
 * Aplica máscara de CPF no formato: 000.000.000-00
 */
export const applyCpfMask = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  }
};

/**
 * Remove a máscara do CPF, retornando apenas os dígitos
 */
export const removeCpfMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida se o CPF tem 11 dígitos
 */
export const isValidCpfLength = (cpf: string): boolean => {
  const numbers = removeCpfMask(cpf);
  return numbers.length === 11;
};
