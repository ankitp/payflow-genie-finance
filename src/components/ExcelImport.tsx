
import React, { useState, useRef } from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const ExcelImport: React.FC = () => {
  const { importBeneficiaries } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        // Map the Excel data to our Beneficiary type
        const beneficiaries = jsonData.map((row: any) => {
          return {
            name: row.name || row.Name || row.NAME || '',
            accountNumber: (row.accountNumber || row.AccountNumber || row['Account Number'] || row['ACCOUNT NUMBER'] || '')
              .toString(),
            ifscCode: row.ifscCode || row.IfscCode || row['IFSC Code'] || row['IFSC CODE'] || '',
            accountType: (row.accountType || row.AccountType || row['Account Type'] || row['ACCOUNT TYPE'] || '10')
              .toString(),
            place: row.place || row.Place || row.PLACE || '',
            email: row.email || row.Email || row.EMAIL || '',
            mobile: (row.mobile || row.Mobile || row.MOBILE || '')
              .toString(),
          };
        });

        // Validate data
        const validBeneficiaries = beneficiaries.filter(b => 
          b.name && b.accountNumber && b.ifscCode
        );
        
        if (validBeneficiaries.length === 0) {
          toast.error('No valid beneficiary data found in the file');
        } else if (validBeneficiaries.length < beneficiaries.length) {
          importBeneficiaries(validBeneficiaries);
          toast.warning(`Imported ${validBeneficiaries.length} beneficiaries. ${beneficiaries.length - validBeneficiaries.length} entries were invalid and skipped.`);
        } else {
          importBeneficiaries(validBeneficiaries);
          toast.success(`Successfully imported ${validBeneficiaries.length} beneficiaries`);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Error parsing Excel file. Please check the format.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading the file');
      setIsUploading(false);
    };
    
    reader.readAsBinaryString(file);
  };

  const clearFile = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Beneficiaries from Excel</CardTitle>
        <CardDescription>
          Upload an Excel file (.xlsx, .xls) containing beneficiary information.
          Required columns: name, accountNumber, ifscCode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Drag and drop an Excel file here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {fileName ? (
            <div className="mt-4 flex items-center gap-2 bg-gray-100 p-2 rounded">
              <span className="text-sm">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="h-6 w-6 p-0"
              >
                <X size={12} />
              </Button>
            </div>
          ) : null}
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Browse Files'}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="text-sm text-gray-500">
          <p className="font-medium mb-1">Excel file format:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Column headers should match field names (name, accountNumber, ifscCode, etc.)</li>
            <li>Account type: use 10 for Saving, 11 for Current</li>
            <li>All account numbers will be treated as text to preserve formatting</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExcelImport;
