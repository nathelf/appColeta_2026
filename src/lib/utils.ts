import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para o formato DD;MM;YYYY
 * @param date - Data a ser formatada (Date, string ou número)
 * @returns String formatada no padrão DD;MM;YYYY
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day};${month};${year}`;
}

/**
 * Formata uma data e hora para o formato DD;MM;YYYY HH:MM:SS
 * @param date - Data a ser formatada (Date, string ou número)
 * @returns String formatada no padrão DD;MM;YYYY HH:MM:SS
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${day};${month};${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Converte uma data do formato DD;MM;YYYY para YYYY-MM-DD (ISO)
 * @param dateStr - Data no formato DD;MM;YYYY
 * @returns Data no formato YYYY-MM-DD ou string vazia se inválida
 */
export function dateDDMMYYYYToISO(dateStr: string): string {
  if (!dateStr) return '';
  
  const parts = dateStr.split(/[;-]/);
  if (parts.length !== 3) return '';
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  
  // Validação básica
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return '';
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return '';
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data do formato YYYY-MM-DD (ISO) para DD;MM;YYYY
 * @param dateStr - Data no formato YYYY-MM-DD
 * @returns Data no formato DD;MM;YYYY ou string vazia se inválida
 */
export function dateISOToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  
  const part0 = parts[0];
  const part1 = parts[1];
  const part2 = parts[2];

  if (part0.length === 4) {
    return `${part2};${part1};${part0}`;
  }

  if (part2.length === 4) {
    return `${part0};${part1};${part2}`;
  }

  return '';
}

/**
 * Aplica máscara DD;MM;YYYY em um input de data
 * @param value - Valor digitado
 * @returns Valor formatado com máscara DD;MM;YYYY
 */
export function maskDateDDMMYYYY(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)};${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)};${numbers.slice(2, 4)};${numbers.slice(4, 8)}`;
  }
}