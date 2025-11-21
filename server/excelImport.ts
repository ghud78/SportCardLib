import * as XLSX from 'xlsx';
import { getDb } from './db';
import { cards, brands, series, inserts, parallels, teams, autographTypes } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface ExcelTemplateColumn {
  header: string;
  field: string;
  required: boolean;
  example?: string;
}

export const TEMPLATE_COLUMNS: ExcelTemplateColumn[] = [
  { header: 'Player Name', field: 'playerName', required: true, example: 'Michael Jordan' },
  { header: 'Team', field: 'teamId', required: false, example: 'Chicago Bulls' },
  { header: 'Brand', field: 'brandId', required: false, example: 'Panini' },
  { header: 'Series', field: 'seriesId', required: false, example: 'Prizm' },
  { header: 'Insert', field: 'insertId', required: false, example: 'Silver' },
  { header: 'Parallel', field: 'parallelId', required: false, example: 'Rookie' },
  { header: 'Memorabilia', field: 'memorabilia', required: false, example: 'Jersey Patch' },
  { header: 'Season / Year', field: 'season', required: true, example: '2012-13' },
  { header: 'Card Number', field: 'cardNumber', required: true, example: '147' },
  { header: 'Autograph', field: 'autograph', required: false, example: 'Yes' },
  { header: 'Type of Autograph', field: 'autographTypeId', required: false, example: 'On-card' },
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
  inserts: string[];
  parallels: string[];
  teams: string[];
  autographTypes: string[];
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
    inserts: [],
    parallels: [],
    teams: [],
    autographTypes: [],
  };
  const preview: any[] = [];
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  // Load existing reference data
  const existingBrands = await db.select().from(brands);
  const existingSeries = await db.select().from(series);
  const existingInsert = await db.select().from(inserts);
  const existingParallels = await db.select().from(parallels);
  const existingTeams = await db.select().from(teams);
  const existingAutographTypes = await db.select().from(autographTypes);
  
  const brandNames = new Set(existingBrands.map(b => b.name.toLowerCase()));
  const seriesNames = new Set(existingSeries.map(s => s.name.toLowerCase()));
  const insertsNames = new Set(existingInsert.map(s => s.name.toLowerCase()));
  const parallelNames = new Set(existingParallels.map(s => s.name.toLowerCase()));
  const teamNames = new Set(existingTeams.map(t => t.name.toLowerCase()));
  const autographTypeNames = new Set(existingAutographTypes.map(a => a.name.toLowerCase()));
  
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
    
    // Check inserts exists
    if (cardData.insertId && !insertsNames.has(cardData.insertId.toLowerCase())) {
      if (!missingData.inserts.includes(cardData.insertId)) {
        missingData.inserts.push(cardData.insertId);
      }
    }
    
    // Check parallel exists
    if (cardData.parallelId && !parallelNames.has(cardData.parallelId.toLowerCase())) {
      if (!missingData.parallels.includes(cardData.parallelId)) {
        missingData.parallels.push(cardData.parallelId);
      }
    }
    
    // Check team exists
    if (cardData.teamId && !teamNames.has(cardData.teamId.toLowerCase())) {
      if (!missingData.teams.includes(cardData.teamId)) {
        missingData.teams.push(cardData.teamId);
      }
    }
    
    // Check autograph type exists
    if (cardData.autographTypeId && !autographTypeNames.has(cardData.autographTypeId.toLowerCase())) {
      if (!missingData.autographTypes.includes(cardData.autographTypeId)) {
        missingData.autographTypes.push(cardData.autographTypeId);
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
    missingData.inserts.length > 0 ||
    missingData.parallels.length > 0 ||
    missingData.teams.length > 0 ||
    missingData.autographTypes.length > 0;
  
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
  const existingInsert = await db.select().from(inserts);
  const existingParallels = await db.select().from(parallels);
  const existingTeams = await db.select().from(teams);
  const existingAutographTypes = await db.select().from(autographTypes);
  
  const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase(), b.id]));
  const seriesMap = new Map(existingSeries.map(s => [s.name.toLowerCase(), s.id]));
  const insertsMap = new Map(existingInsert.map(s => [s.name.toLowerCase(), s.id]));
  const parallelMap = new Map(existingParallels.map(s => [s.name.toLowerCase(), s.id]));
  const teamMap = new Map(existingTeams.map(t => [t.name.toLowerCase(), t.id]));
  const autographTypeMap = new Map(existingAutographTypes.map(a => [a.name.toLowerCase(), a.id]));
  
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
      } else if (dbField === 'insertId' && value) {
        cardData.insertId = insertsMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'parallelId' && value) {
        cardData.parallelId = parallelMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'teamId' && value) {
        cardData.teamId = teamMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'autographTypeId' && value) {
        cardData.autographTypeId = autographTypeMap.get(value.toLowerCase()) || null;
      } else if (dbField === 'memorabilia' && value) {
        cardData.memorabilia = value;
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
