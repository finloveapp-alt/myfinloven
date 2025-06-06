export const validateCardNumber = (cardNumber: string): boolean => {
  // Algoritmo de Luhn para validação de cartão
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const [month, year] = expiryDate.split('/');
  if (!month || !year) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

export const formatCardNumber = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Adiciona espaços a cada 4 dígitos
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  // Limita a 19 caracteres (16 dígitos + 3 espaços)
  return formatted.substring(0, 19);
};

export const formatExpiryDate = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Adiciona a barra após os primeiros 2 dígitos
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  
  return cleaned;
};

export const getCardType = (cardNumber: string): 'mastercard' | 'visa' | 'elo' | 'american_express' | null => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Visa: começa com 4
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard: começa com 5 ou 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(cleaned)) {
    return 'mastercard';
  }
  
  // American Express: começa com 34 ou 37
  if (/^3[47]/.test(cleaned)) {
    return 'american_express';
  }
  
  // Elo: vários ranges específicos
  if (/^(4011|4312|4389|4514|4573|5041|5066|5067|6277|6362|6363|6504|6505|6516)/.test(cleaned)) {
    return 'elo';
  }
  
  return null;
}; 