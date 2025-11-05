// src/utils/validators.js

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} - true se válido
 */
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  let rest;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida CNPJ brasileiro
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean} - true se válido
 */
export const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/\D/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

/**
 * Valida email
 * @param {string} email
 * @returns {boolean} - true se válido
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP com ou sem formatação
 * @returns {boolean} - true se válido
 */
export const validateCEP = (cep) => {
  cep = cep.replace(/\D/g, '');
  return cep.length === 8;
};

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone com ou sem formatação
 * @returns {boolean} - true se válido
 */
export const validatePhone = (phone) => {
  phone = phone.replace(/\D/g, '');
  return phone.length === 10 || phone.length === 11;
};

/**
 * Valida data no formato DD/MM/AAAA
 * @param {string} date - Data no formato DD/MM/AAAA
 * @returns {boolean} - true se válido
 */
export const validateDate = (date) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(date)) return false;
  
  const [day, month, year] = date.split('/').map(Number);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Verificar dias do mês
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  
  return true;
};

/**
 * Valida se a data é anterior a hoje (para data de nascimento)
 * @param {string} date - Data no formato DD/MM/AAAA
 * @returns {boolean} - true se válido
 */
export const validateBirthDate = (date) => {
  if (!validateDate(date)) return false;
  
  const [day, month, year] = date.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  return birthDate < today;
};

/**
 * Valida senha (mínimo 8 caracteres)
 * @param {string} password
 * @returns {boolean} - true se válido
 */
export const validatePassword = (password) => {
  return password.length >= 8;
};

/**
 * Valida se as senhas coincidem
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean} - true se coincidem
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};

export default {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validateCEP,
  validatePhone,
  validateDate,
  validateBirthDate,
  validatePassword,
  validatePasswordMatch,
};
