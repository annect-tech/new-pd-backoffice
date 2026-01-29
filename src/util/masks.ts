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

/**
 * Aplica máscara de telefone celular no formato (00) 00000-0000
 */
export const applyPhoneMask = (value: string): string => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * Remove a máscara do telefone
 */
export const removePhoneMask = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Aplica máscara de CNPJ no formato: 00.000.000/0001-00
 */
export const applyCnpjMask = (value: string): string => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
};

/**
 * Remove a máscara do CNPJ, retornando apenas os dígitos
 */
export const removeCnpjMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Formata data de YYYY-MM-DD para DD/MM/YYYY
 */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Se já estiver no formato DD/MM/YYYY ou DD-MM-YYYY, retorna como está
    if (dateString.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/)) {
      return dateString.replace(/-/g, '/');
    }
    // Se estiver no formato YYYY-MM-DD, converte para DD/MM/YYYY
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

/**
 * Converte data de DD/MM/YYYY ou DD-MM-YYYY para YYYY-MM-DD
 */
export const convertDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Se já estiver no formato YYYY-MM-DD, retorna como está
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Se estiver no formato DD/MM/YYYY ou DD-MM-YYYY, converte
    const parts = dateString.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (parts) {
      const [, day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
};

/**
 * Aplica máscara de data no formato DD/MM/YYYY
 */
export const applyDateMask = (value: string): string => {
  if (!value) return '';
  // Remove tudo que não é dígito ou barra/hífen
  const cleaned = value.replace(/[^\d\/\-]/g, '');
  const numbers = cleaned.replace(/[\/\-]/g, '');
  
  // Se já tem formato DD/MM/YYYY ou DD-MM-YYYY, manter
  if (cleaned.match(/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/)) {
    return cleaned;
  }
  
  // Aplicar máscara progressiva
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
};
