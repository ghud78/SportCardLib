import * as XLSX from 'xlsx';
import { getDb } from './db';
import { cards, brands, series, subseries, specialties } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface ExcelTemplateColumn {
  header: string;
  field: string;
  required: boolean;
  example?: string;
}

export const TEMPLATE_COLUMNS: ExcelTemplateColumn[] = [
  { header: 'Player Name', field: 'playerName', required: true, example: 'Michael Jordan' },
  { header: 'Brand', field: 'brandId', required: false, example: 'Panini' },
  { header: 'Series', field: 'seriesId', required: false, example: 'Prizm' },
  { header: 'Subseries', field: 'subseriesId', required: false, example: 'Silver' },
  { header: 'Specialty', field: 'specialtyId', required: false, example: 'Rookie' },
  { header: 'Season / Year', field: 'season', required: true, example: '2012-13' },
  { header: 'Card Number', field: 'cardNumber', required: true, example: '147' },
  { header: 'Autograph', field: 'autograph', required: false, example: 'Yes' },
  { header: 'Numbered', field: 'numbered', required: false, example: 'Yes' },
  { header: 'Current #', field: 'numberedCurrent', required: false, example: '221' },
  { header: 'Of #', field: 'numberedOf', required: false, example: '499' },
  { header: 'Notes', field: 'notes', required: false, example: 'Mint condition' },
];

export async function generateExcelTemplate(): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  
  // Create header row
  const headers = TEMPLATE_COLUMNS.map(col => col.header);
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  
  // Set column widths
  worksheet['!cols'] = headers.map(() => ({ wch: 20 }));
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cards');
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

export interface ParsedExcelData {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseExcelFile(fileBuffer: Buffer): Promise<ParsedExcelData> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert to JSON with header row
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
  
  if (jsonData.length === 0) {
    throw new Error('Excel file is empty');
  }
  
  const headers = jsonData[0];
  const rows = jsonData.slice(1).map(row => {
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index]?.toString() || '';
    });
    return rowData;
  });
  
  return { headers, rows };
}

export interface ColumnMapping {
  excelColumn: string;
  dbField: string;
}

export function autoMatchColumns(excelHeaders: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  
  for (const excelHeader of excelHeaders) {
    const normalizedExcel = excelHeader.toLowerCase().trim();
    
    // Try exact match first
    let matched = TEMPLATE_COLUMNS.find(
      col => col.header.toLowerCase() === normalizedExcel
    );
    
    // Try fuzzy match
    if (!matched) {
      matched = TEMPLATE_COLUMNS.find(col => {
        const normalizedTemplate = col.header.toLowerCase();
        return normalizedTemplate.includes(normalizedExcel) || 
               normalizedExcel.includes(normalizedTemplate);
      });
    }
    
    if (matched) {
      mappings.push({
        excelColumn: excelHeader,
        dbField: matched.field,
      });
    }
  }
  
  return mappings;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface MissingReferenceData {
  brands: string[];
  series: string[];
  subseries: string[];
  specialties: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  missingData: MissingReferenceData;
  preview: any[];
}

export async function validateImportData(
  rows: Record<string, string>[],
  mappings: ColumnMapping[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const missingData: MissingReferenceData = {
    brands: [],
    series: [],
    subseries: [],
    specialties: [],
  };
  const preview: any[] = [];
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  // Load existing reference data
  const existingBrands = await db.select().from(brands);
  const existingSeries = await db.select().from(series);
  const existingSubseries = await db.select().from(subseries);
  const existingSpecialties = await db.select().from(specialties);
  
  const brandNames = new Set(existingBrands.map(b => b.name.toLowerCase()));
  const seriesNames = new Set(existingSeries.map(s => s.name.toLowerCase()));
  const subseriesNames = new Set(existingSubseries.map(s => s.name.toLowerCase()));
  const specialtyNames = new Set(existingSpecialties.map(s => s.name.toLowerCase()));
  
  // Create mapping lookup
  const fieldMap = new Map(mappings.map(m => [m.dbField, m.excelColumn]));
  
  // Check required fields are mapped
  const requiredFields = TEMPLATE_COLUMNS.filter(c => c.required).map(c => c.field);
  for (const reqField of requiredFields) {
    if (!fieldMap.has(reqField)) {
      errors.push({
        row: 0,
        field: reqField,
        message: `Required field "${TEMPLATE_COLUMNS.find(c => c.field === reqField)?.header}" is not mapped`,
      });
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors, missingData, preview: [] };
  }
  
  // Validate each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because Excel is 1-indexed and row 1 is header
    
    const cardData: any = {};
    
    // Map fields
    for (const [dbField, excelColumn] of Array.from(fieldMap.entries())) {
      const value = row[excelColumn]?.trim() || '';
      cardData[dbField] = value;
    }
    
    // Validate required fields
    if (!cardData.playerName) {
      errors.push({ row: rowNum, field: 'playerName', message: 'Player Name is required' });
    }
    if (!cardData.season) {
      errors.push({ row: rowNum, field: 'season', message: 'Season/Year is required' });
    }
    if (!cardData.cardNumber) {
      errors.push({ row: rowNum, field: 'cardNumber', message: 'Card Number is required' });
    }
    
    // Check brand exists
    if (cardData.brandId && !brandNames.has(cardData.brandId.toLowerCase())) {
      if (!missingData.brands.includes(cardData.brandId)) {
        missingData.brands.push(cardData.brandId);
      }
    }
    
    // Check series exists
    if (cardData.seriesId && !seriesNames.has(cardData.seriesId.toLowerCase())) {
      if (!missingData.series.includes(cardData.seriesId)) {
        missingData.series.push(cardData.seriesId);
      }
    }
    
    // Check subseries exists
    if (cardData.subseriesId && !subseriesNames.has(cardData.subseriesId.toLowerCase())) {
      if (!missingData.subseries.includes(cardData.subseriesId)) {
        missingData.subseries.push(cardData.subseriesId);
      }
    }
    
    // Check specialty exists
    if (cardData.specialtyId && !specialtyNames.has(cardData.specialtyId.toLowerCase())) {
      if (!missingData.specialties.includes(cardData.specialtyId)) {
        missingData.specialties.push(cardData.specialtyId);
      }
    }
    
    preview.push({
      rowNumber: rowNum,
      ...cardData,
    });
  }
  
  const hasMissingData = 
    missingData.brands.length > 0 ||
    missingData.series.length > 0 ||
    missingData.subseries.length > 0 ||
    missingData.specialties.length > 0;
  
  return {
    valid: errors.length === 0 && !hasMissingData,
    errors,
    missingData,
    preview,
  };
}

export async function importCards(
  collectionId: number,
  rows: Record<string, string>[],
  mappings: ColumnMapping[]
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  // Load reference data for ID lookup
  const existingBrands = await db.select().from(brands);
  const existingSeries = await db.select().from(series);
  const existingSubseries = await db.select().from(subseries);
  const existingSpecialties = await db.select().from(specialties);
  
  const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase(), b.id]));
  const seriesMap = new Map(existingSeries.map(s => [s.name.toLowerCase(), s.id]));
  const subseriesMap = new Map(existingSubseries.map(s => [s.name.toLowerCase(), s.id]));
  const specialtyMap = new Map(existingSpecialties.map(s => [s.name.toLowerCase(), s.id]));
  
  const fieldMap = new Map(mappings.map(m => [m.dbField, m.excelColumn]));
  
  for (const row of rows) {
    const cardData: any = {
      collectionId,
    };
    
    // Map fields
    for (const [dbField, excelColumn] of Array.from(fieldMap.entries())) {
      const value = row[excelColumn]?.trim() || '';
      
      if (dbField === 'brandId' && value) {
        cardData.brandId = brandMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'seriesId' && value) {
        cardData.seriesId = seriesMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'subseriesId' && value) {
        cardData.subseriesId = subseriesMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'specialtyId' && value) {
        cardData.specialtyId = specialtyMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'autograph') {
        cardData.autograph = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
      } else if (dbField === 'numbered') {
        cardData.numbered = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
      } else if (dbField === 'numberedCurrent' || dbField === 'numberedOf') {
        cardData[dbField] = value ? parseInt(value, 10) : null;
      } else {
        cardData[dbField] = value || null;
      }
    }
    
    await db.insert(cards).values(cardData);
  }
}
