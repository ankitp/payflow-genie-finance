
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
        
        console.log('Excel data loaded:', jsonData);
        
        if (jsonData.length === 0) {
          toast.error('No data found in the Excel file');
          setIsUploading(false);
          return;
        }
        
        // Map the Excel data to our Beneficiary type with more flexible field mapping
        const beneficiaries = jsonData.map((row: any) => {
          // Function to find the first non-empty value from possible field names
          const getField = (possibleNames: string[]) => {
            for (const name of possibleNames) {
              if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                return String(row[name]).toString().trim();
              }
            }
            return '';
          };

          // Log each row to help debug
          console.log('Processing row:', row);

          // Define possible field names for each property
          const nameFields = ['name', 'Name', 'NAME', 'beneficiary name', 'Beneficiary Name', 'BENEFICIARY NAME', 'BeneficiaryName'];
          const accountFields = ['accountNumber', 'AccountNumber', 'Account Number', 'ACCOUNT NUMBER', 'account', 'Account', 'ACCOUNT', 'Account No', 'account no', 'ACCOUNT NO', 'Account_Number'];
          const ifscFields = ['ifscCode', 'IfscCode', 'IFSC Code', 'IFSC CODE', 'ifsc', 'Ifsc', 'IFSC', 'IFSC_Code', 'ifsc_code'];
          const accountTypeFields = ['accountType', 'AccountType', 'Account Type', 'ACCOUNT TYPE', 'type', 'Type', 'TYPE', 'Account_Type'];
          const placeFields = ['place', 'Place', 'PLACE', 'city', 'City', 'CITY', 'location', 'Location', 'LOCATION'];
          const emailFields = ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'E-MAIL', 'Email_Address'];
          const mobileFields = ['mobile', 'Mobile', 'MOBILE', 'phone', 'Phone', 'PHONE', 'contact', 'Contact', 'CONTACT', 'Mobile_Number', 'Phone_Number'];

          const name = getField(nameFields);
          const accountNumber = getField(accountFields);
          const ifscCode = getField(ifscFields);
          
          // For account type, convert text values to codes if needed
          let accountType = getField(accountTypeFields);
          if (!accountType || accountType === '') {
            accountType = '10'; // Default to savings if not specified
          } else if (accountType.toLowerCase().includes('sav')) {
            accountType = '10';
          } else if (accountType.toLowerCase().includes('cur')) {
            accountType = '11';
          }

          // Create the beneficiary object
          const beneficiary = {
            name,
            accountNumber,
            ifscCode,
            accountType,
            place: getField(placeFields),
            email: getField(emailFields),
            mobile: getField(mobileFields),
          };
          
          console.log('Mapped beneficiary:', beneficiary);
          return beneficiary;
        });

        // Validate data - at minimum we need name, account number and IFSC
        const validBeneficiaries = beneficiaries.filter(b => 
          b.name && b.accountNumber && b.ifscCode
        );
        
        console.log('Valid beneficiaries:', validBeneficiaries);
        
        if (validBeneficiaries.length === 0) {
          toast.error('No valid beneficiary data found in the file. Please ensure your file has columns for name, account number, and IFSC code.');
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
          Required columns: name, account number, IFSC code.
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
            <li>We recognize various column header formats (e.g., "Name", "name", "NAME", etc.)</li>
            <li>Required fields: Name, Account Number, IFSC Code</li>
            <li>For Account Type: "Savings"/"Current" or "10"/"11" are both accepted</li>
            <li>Optional fields: Place, Email, Mobile</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExcelImport;
