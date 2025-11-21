import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Upload, Download, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExcelImportWizardProps {
  collectionId: number;
  collectionName: string;
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ColumnMapping {
  excelColumn: string;
  dbField: string;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; field: string; message: string }>;
  missingData: {
    brands: string[];
    series: string[];
    inserts: string[];
    parallels: string[];
  };
  preview: any[];
}

const DB_FIELDS = [
  { value: "playerName", label: "Player Name", required: true },
  { value: "brandId", label: "Brand", required: false },
  { value: "seriesId", label: "Series", required: false },
  { value: "insertId", label: "Insert", required: false },
  { value: "parallelId", label: "Specialty", required: false },
  { value: "season", label: "Season / Year", required: true },
  { value: "cardNumber", label: "Card Number", required: true },
  { value: "autograph", label: "Autograph", required: false },
  { value: "numbered", label: "Numbered", required: false },
  { value: "numberedCurrent", label: "Current #", required: false },
  { value: "numberedOf", label: "Of #", required: false },
  { value: "notes", label: "Notes", required: false },
];

export default function ExcelImportWizard({
  collectionId,
  collectionName,
  open,
  onClose,
  onImportComplete,
}: ExcelImportWizardProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "validation">("upload");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const downloadTemplateMutation = trpc.excel.downloadTemplate.useQuery(undefined, {
    enabled: false,
  });
  
  const parseFileMutation = trpc.excel.parseFile.useMutation();
  const validateMutation = trpc.excel.validate.useMutation();
  const importMutation = trpc.excel.import.useMutation();
  
  const handleDownloadTemplate = async () => {
    try {
      const result = await downloadTemplateMutation.refetch();
      if (result.data) {
        const buffer = new Uint8Array(Array.from(atob(result.data.data), c => c.charCodeAt(0)));
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Template downloaded successfully");
      }
    } catch (error) {
      toast.error("Failed to download template");
      console.error(error);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(arrayBuffer))));
      setFileData(base64);
      
      const result = await parseFileMutation.mutateAsync({ fileData: base64 });
      setExcelHeaders(result.headers);
      setRowCount(result.rowCount);
      setMappings(result.autoMappings);
      setStep("mapping");
      toast.success(`File parsed: ${result.rowCount} rows found`);
    } catch (error) {
      toast.error("Failed to parse Excel file");
      console.error(error);
    }
  };
  
  const handleMappingChange = (excelColumn: string, dbField: string) => {
    setMappings(prev => {
      const existing = prev.find(m => m.excelColumn === excelColumn);
      if (existing) {
        return prev.map(m =>
          m.excelColumn === excelColumn ? { ...m, dbField } : m
        );
      } else {
        return [...prev, { excelColumn, dbField }];
      }
    });
  };
  
  const handleValidate = async () => {
    if (!fileData) return;
    
    try {
      const result = await validateMutation.mutateAsync({
        fileData,
        mappings,
      });
      setValidationResult(result);
      setStep("validation");
    } catch (error) {
      toast.error("Validation failed");
      console.error(error);
    }
  };
  
  const handleImport = async () => {
    if (!fileData || !validationResult?.valid) return;
    
    try {
      const result = await importMutation.mutateAsync({
        collectionId,
        fileData,
        mappings,
      });
      toast.success(`Successfully imported ${result.importedCount} cards`);
      onImportComplete();
      handleClose();
    } catch (error) {
      toast.error("Import failed");
      console.error(error);
    }
  };
  
  const handleClose = () => {
    setStep("upload");
    setFileData(null);
    setFileName("");
    setExcelHeaders([]);
    setRowCount(0);
    setMappings([]);
    setValidationResult(null);
    onClose();
  };
  
  const requiredFieldsMapped = DB_FIELDS.filter(f => f.required).every(field =>
    mappings.some(m => m.dbField === field.value)
  );
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Import Cards to {collectionName}
          </DialogTitle>
        </DialogHeader>
        
        {step === "upload" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Upload an Excel file (.xlsx) with your card data
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={downloadTemplateMutation.isFetching}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Download the template to see the expected column format. Required fields are:
                Player Name, Season/Year, and Card Number.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {step === "mapping" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Map Columns</h3>
              <p className="text-sm text-muted-foreground">
                Found {rowCount} rows in {fileName}. Map Excel columns to database fields.
              </p>
            </div>
            
            <div className="space-y-3">
              {excelHeaders.map(header => {
                const currentMapping = mappings.find(m => m.excelColumn === header);
                const mappedField = DB_FIELDS.find(f => f.value === currentMapping?.dbField);
                
                return (
                  <div key={header} className="flex items-center gap-4">
                    <div className="flex-1 font-medium">{header}</div>
                    <div className="flex-1">
                      <Select
                        value={currentMapping?.dbField || ""}
                        onValueChange={(value) => handleMappingChange(header, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Skip --</SelectItem>
                          {DB_FIELDS.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label} {field.required && "*"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {!requiredFieldsMapped && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please map all required fields: Player Name, Season/Year, and Card Number
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={handleValidate}
                disabled={!requiredFieldsMapped || validateMutation.isPending}
              >
                Next: Validate
              </Button>
            </div>
          </div>
        )}
        
        {step === "validation" && validationResult && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Validation Results</h3>
              <p className="text-sm text-muted-foreground">
                Review the validation results before importing
              </p>
            </div>
            
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">
                    Found {validationResult.errors.length} error(s):
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i} className="text-sm">
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <li className="text-sm">
                        ... and {validationResult.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {(validationResult.missingData.brands.length > 0 ||
              validationResult.missingData.series.length > 0 ||
              validationResult.missingData.inserts.length > 0 ||
              validationResult.missingData.parallels.length > 0) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">
                    Missing reference data - please add these to the database first:
                  </div>
                  {validationResult.missingData.brands.length > 0 && (
                    <div className="mb-2">
                      <strong>Brands:</strong> {validationResult.missingData.brands.join(", ")}
                    </div>
                  )}
                  {validationResult.missingData.series.length > 0 && (
                    <div className="mb-2">
                      <strong>Series:</strong> {validationResult.missingData.series.join(", ")}
                    </div>
                  )}
                  {validationResult.missingData.inserts.length > 0 && (
                    <div className="mb-2">
                      <strong>Insert:</strong> {validationResult.missingData.inserts.join(", ")}
                    </div>
                  )}
                  {validationResult.missingData.parallels.length > 0 && (
                    <div>
                      <strong>Parallels:</strong> {validationResult.missingData.parallels.join(", ")}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {validationResult.valid && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  All {validationResult.preview.length} rows passed validation. Ready to import!
                </AlertDescription>
              </Alert>
            )}
            
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Row</th>
                    <th className="p-2 text-left">Player</th>
                    <th className="p-2 text-left">Season</th>
                    <th className="p-2 text-left">Card #</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.preview.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.rowNumber}</td>
                      <td className="p-2">{row.playerName}</td>
                      <td className="p-2">{row.season}</td>
                      <td className="p-2">{row.cardNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validationResult.preview.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground border-t">
                  ... and {validationResult.preview.length - 10} more rows
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={!validationResult.valid || importMutation.isPending}
              >
                {importMutation.isPending ? "Importing..." : "Import Cards"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
