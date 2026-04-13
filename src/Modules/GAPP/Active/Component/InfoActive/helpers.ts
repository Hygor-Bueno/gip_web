import { PlaceAddress } from '../../Interfaces/Interfaces';

export const formatDate = (value?: string | null): string => {
  if (!value) return '';
  return value.split('-').reverse().join('/');
};

export const formatCurrency = (value?: string | number | null): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const parsePlacePurchase = (raw?: PlaceAddress | string | null): PlaceAddress | null => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw) as PlaceAddress;
  } catch {
    return null;
  }
};
