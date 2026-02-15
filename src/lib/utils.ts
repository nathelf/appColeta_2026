import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_SEP = '/';

/**
 * Formata uma data para o formato DD/MM/YYYY
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}${DATE_SEP}${month}${DATE_SEP}${year}`;
}

/**
 * Formata uma data e hora para o formato DD/MM/YYYY HH:MM:SS
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

  return `${day}${DATE_SEP}${month}${DATE_SEP}${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Valida se a data é real (ex: 31/02 inválido)
 */
function isValidDate(day: number, month: number, year: number): boolean {
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * Converte uma data do formato DD/MM/YYYY (ou DD;MM;YYYY) para YYYY-MM-DD (ISO)
 * Valida datas reais (rejeita 31/02, 29/02 em ano não bissexto, etc.)
 */
export function dateDDMMYYYYToISO(dateStr: string): string {
  if (!dateStr) return '';

  const parts = dateStr.split(/[/;-]/);
  if (parts.length !== 3) return '';

  const day = parts[0].replace(/\D/g, '').padStart(2, '0');
  const month = parts[1].replace(/\D/g, '').padStart(2, '0');
  const year = parts[2].replace(/\D/g, '');

  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return '';
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return '';
  if (yearNum < 1900 || yearNum > 2100) return '';

  if (!isValidDate(dayNum, monthNum, yearNum)) return '';

  return `${yearNum}-${month}-${day}`;
}

/**
 * Converte uma data do formato YYYY-MM-DD (ISO) para DD/MM/YYYY
 */
export function dateISOToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';

  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';

  const part0 = parts[0];
  const part1 = parts[1];
  const part2 = parts[2];

  if (part0.length === 4) {
    return `${part2}${DATE_SEP}${part1}${DATE_SEP}${part0}`;
  }

  if (part2.length === 4) {
    return `${part0}${DATE_SEP}${part1}${DATE_SEP}${part2}`;
  }

  return '';
}

/**
 * Aplica máscara DD/MM/YYYY em um input de data
 */
export function maskDateDDMMYYYY(value: string): string {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}${DATE_SEP}${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}${DATE_SEP}${numbers.slice(2, 4)}${DATE_SEP}${numbers.slice(4, 8)}`;
  }
}