// src/utils/formatters.js

/**
 * Formata CPF (000.000.000-00)
 * @param {string} cpf - CPF sem formatação
 * @returns {string} - CPF formatado
 */
export const formatCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');
  cpf = cpf.substring(0, 11);
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return cpf;
};

/**
 * Remove formatação do CPF
 * @param {string} cpf - CPF formatado
 * @returns {string} - CPF sem formatação
 */
export const unformatCPF = (cpf) => {
  return cpf.replace(/\D/g, '');
};

/**
 * Formata CNPJ (00.000.000/0000-00)
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} - CNPJ formatado
 */
export const formatCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/\D/g, '');
  cnpj = cnpj.substring(0, 14);
  cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
  cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
  cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
  return cnpj;
};

/**
 * Remove formatação do CNPJ
 * @param {string} cnpj - CNPJ formatado
 * @returns {string} - CNPJ sem formatação
 */
export const unformatCNPJ = (cnpj) => {
  return cnpj.replace(/\D/g, '');
};

/**
 * Formata CEP (00000-000)
 * @param {string} cep - CEP sem formatação
 * @returns {string} - CEP formatado
 */
export const formatCEP = (cep) => {
  cep = cep.replace(/\D/g, '');
  cep = cep.substring(0, 8);
  cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
  return cep;
};

/**
 * Remove formatação do CEP
 * @param {string} cep - CEP formatado
 * @returns {string} - CEP sem formatação
 */
export const unformatCEP = (cep) => {
  return cep.replace(/\D/g, '');
};

/**
 * Formata telefone ((00) 00000-0000 ou (00) 0000-0000)
 * @param {string} phone - Telefone sem formatação
 * @returns {string} - Telefone formatado
 */
export const formatPhone = (phone) => {
  phone = phone.replace(/\D/g, '');
  phone = phone.substring(0, 11);
  
  if (phone.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
    phone = phone.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
    phone = phone.replace(/(\d{5})(\d)/, '$1-$2');
  }
  
  return phone;
};

/**
 * Remove formatação do telefone
 * @param {string} phone - Telefone formatado
 * @returns {string} - Telefone sem formatação
 */
export const unformatPhone = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Formata data (DD/MM/AAAA)
 * @param {string} date - Data sem formatação
 * @returns {string} - Data formatada
 */
export const formatDate = (date) => {
  date = date.replace(/\D/g, '');
  date = date.substring(0, 8);
  
  if (date.length <= 2) {
    return date;
  }
  
  if (date.length <= 4) {
    return date.replace(/(\d{2})(\d)/, '$1/$2');
  }
  
  return date.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
};

/**
 * Converte data do formato DD/MM/AAAA para AAAA-MM-DD (para API)
 * @param {string} date - Data no formato DD/MM/AAAA
 * @returns {string} - Data no formato AAAA-MM-DD
 */
export const dateToISO = (date) => {
  if (!date || date.length !== 10) return '';
  
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Converte data do formato AAAA-MM-DD para DD/MM/AAAA (da API)
 * @param {string} date - Data no formato AAAA-MM-DD
 * @returns {string} - Data no formato DD/MM/AAAA
 */
export const dateFromISO = (date) => {
  if (!date) return '';
  
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Formata moeda brasileira (R$ 0.000,00)
 * @param {string|number} value - Valor sem formatação
 * @returns {string} - Valor formatado
 */
export const formatCurrency = (value) => {
  if (typeof value === 'string') {
    value = value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
  } else {
    value = value.toFixed(2);
  }
  
  value = value.replace('.', ',');
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  
  return `R$ ${value}`;
};

/**
 * Remove formatação da moeda
 * @param {string} value - Valor formatado
 * @returns {number} - Valor numérico
 */
export const unformatCurrency = (value) => {
  value = value.replace('R$', '').trim();
  value = value.replace(/\./g, '');
  value = value.replace(',', '.');
  return parseFloat(value);
};

/**
 * Formata número de cartão de crédito (0000 0000 0000 0000)
 * @param {string} card - Número sem formatação
 * @returns {string} - Número formatado
 */
export const formatCreditCard = (card) => {
  card = card.replace(/\D/g, '');
  card = card.substring(0, 16);
  card = card.replace(/(\d{4})(?=\d)/g, '$1 ');
  return card;
};

/**
 * Capitaliza a primeira letra de cada palavra
 * @param {string} text
 * @returns {string} - Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Trunca texto com reticências
 * @param {string} text - Texto completo
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} - Texto truncado
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formata horário (00:00)
 * @param {string} time - Horário sem formatação
 * @returns {string} - Horário formatado
 */
export const formatTime = (time) => {
  time = time.replace(/\D/g, '');
  time = time.substring(0, 4);
  
  if (time.length <= 2) {
    return time;
  }
  
  return time.replace(/(\d{2})(\d)/, '$1:$2');
};

export default {
  formatCPF,
  unformatCPF,
  formatCNPJ,
  unformatCNPJ,
  formatCEP,
  unformatCEP,
  formatPhone,
  unformatPhone,
  formatDate,
  dateToISO,
  dateFromISO,
  formatCurrency,
  unformatCurrency,
  formatCreditCard,
  capitalize,
  truncate,
  formatTime,
};
