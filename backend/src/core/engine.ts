import { logger } from '../lib/logger';

interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'exists';
  value?: any;
}

export class RuleEngine {
  /**
   * Avalia se um payload satisfaz uma condição.
   */
  static evaluate(payload: any, condition: Condition): boolean {
    const { field, operator, value } = condition;
    
    // Acesso seguro a propriedades aninhadas (ex: "user.address.city")
    const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], payload);

    try {
      switch (operator) {
        case 'eq':
          return fieldValue === value;
        case 'neq':
          return fieldValue !== value;
        case 'gt':
          return Number(fieldValue) > Number(value);
        case 'lt':
          return Number(fieldValue) < Number(value);
        case 'contains':
          return Array.isArray(fieldValue) 
            ? fieldValue.includes(value) 
            : String(fieldValue).includes(String(value));
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        default:
          logger.warn(`Operador desconhecido: ${operator}`);
          return false;
      }
    } catch (error: any) {
      logger.error(`Erro ao avaliar regra: ${error.message}`, { condition, payload });
      return false; // se der erro na lógica, a regra não aplica
    }
  }
}