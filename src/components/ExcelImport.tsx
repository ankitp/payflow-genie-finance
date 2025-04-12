
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Upload, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ExcelImport: React.FC = () => {
  const { importBeneficiaries } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setFile(event.dataTransfer.files[0]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const parseExcelToJson = async (file: File): Promise<Beneficiary[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject('No data found in Excel file');
            return;
          }

          // Get headers from first row
          const headers = (jsonData[0] as string[]).map(header => 
            header.toLowerCase().trim().replace(/\s+/g, '')
          );

          // Map column indices
          const nameIndex = headers.findIndex(h => 
            h.includes('name') || h.includes('beneficiary') || h === 'beneficiaryname'
          );
          const accountNumberIndex = headers.findIndex(h => 
            h.includes('account') || h === 'accountnumber' || h === 'accountno'
          );
          const ifscIndex = headers.findIndex(h => 
            h.includes('ifsc') || h === 'ifsccode'
          );
          const accountTypeIndex = headers.findIndex(h => 
            h.includes('type') || h === 'accounttype'
          );
          const placeIndex = headers.findIndex(h => 
            h.includes('place') || h.includes('city') || h.includes('location')
          );
          const emailIndex = headers.findIndex(h => 
            h.includes('email')
          );
          const mobileIndex = headers.findIndex(h => 
            h.includes('mobile') || h.includes('phone') || h.includes('contact')
          );

          // Check if required columns exist
          if (nameIndex === -1 || accountNumberIndex === -1 || ifscIndex === -1) {
            console.log('Missing required columns. Found headers:', headers);
            console.log('Indices:', { nameIndex, accountNumberIndex, ifscIndex });
            reject('Excel file is missing required columns (Name, Account Number, IFSC Code)');
            return;
          }

          // Parse data rows
          const beneficiaries: Omit<Beneficiary, 'id'>[] = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            
            // Skip empty rows
            if (!row[nameIndex] || !row[accountNumberIndex] || !row[ifscIndex]) {
              continue;
            }
            
            // Handle account type - convert to standard format
            let accountType = '10'; // Default to Savings
            if (accountTypeIndex !== -1 && row[accountTypeIndex]) {
              const typeValue = String(row[accountTypeIndex]).toLowerCase();
              if (typeValue.includes('curr') || typeValue === '11') {
                accountType = '11';
              } else if (typeValue.includes('sav') || typeValue === '10') {
                accountType = '10';
              } else {
                accountType = 'other';
              }
            }
            
            // Convert account number to string and trim any spaces
            const accountNumber = String(row[accountNumberIndex]).replace(/\s/g, '');
            
            beneficiaries.push({
              name: String(row[nameIndex]).toUpperCase(),
              accountNumber: accountNumber,
              ifscCode: String(row[ifscIndex]).toUpperCase(),
              accountType: accountType,
              place: placeIndex !== -1 ? String(row[placeIndex] || '') : '',
              email: emailIndex !== -1 ? String(row[emailIndex] || '') : '',
              mobile: mobileIndex !== -1 ? String(row[mobileIndex] || '') : '',
            });
          }
          
          if (beneficiaries.length === 0) {
            console.log('No valid data found in rows');
            reject('No valid beneficiary data found in the file');
            return;
          }
          
          console.log('Successfully parsed beneficiaries:', beneficiaries);
          resolve(beneficiaries as any);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject('Error parsing Excel file. Please check the file format.');
        }
      };
      
      reader.onerror = () => {
        reject('Error reading Excel file');
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      setUploadStatus('error');
      setErrorMessage('Invalid file format. Only .xlsx or .xls files are supported.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const beneficiaries = await parseExcelToJson(file);
      importBeneficiaries(beneficiaries);
      setUploadStatus('success');
      toast.success(`Successfully imported ${beneficiaries.length} beneficiaries`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus('error');
      setErrorMessage(error as string);
      toast.error(error as string);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Beneficiaries from Excel</CardTitle>
        <CardDescription>
          Upload an Excel file (.xlsx or .xls) with beneficiary details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary-500 ${
            uploadStatus === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".xlsx,.xls"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <FileSpreadsheet size={48} className="text-gray-400" />
            {file ? (
              <>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Your file should include columns for Name, Account Number, and IFSC Code
                </p>
              </>
            )}
          </div>
        </div>

        {uploadStatus === 'success' && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Import Successful</AlertTitle>
            <AlertDescription className="text-green-700">
              The beneficiaries have been successfully imported.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'error' && (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Import Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Required Excel Format:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>First row should contain column headers</li>
            <li>Required columns: Beneficiary Name, Account Number, IFSC Code</li>
            <li>Optional columns: Account Type, Place, Email, Mobile</li>
            <li>For Account Type: use "Saving" or "10" for Savings, "Current" or "11" for Current</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImport} 
          disabled={!file || isUploading}
          className="w-full bg-finance-primary flex items-center"
        >
          {isUploading ? (
            <span>Importing...</span>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
              Import Beneficiaries
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExcelImport;
