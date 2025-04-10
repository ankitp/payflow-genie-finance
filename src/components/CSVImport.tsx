
import React, { useState, useRef } from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CSVImport: React.FC = () => {
  const { importBeneficiaries } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Omit<Beneficiary, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview([]);
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      processCSV(selectedFile);
    }
  };

  const processCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
        
        // Check required columns
        const requiredColumns = ['name', 'accountnumber', 'ifsccode'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setError(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }
        
        const beneficiaries: Omit<Beneficiary, 'id'>[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',').map(value => value.trim());
          
          if (values.length !== headers.length) {
            setError(`Invalid data in row ${i}. Expected ${headers.length} columns but got ${values.length}`);
            return;
          }
          
          const beneficiary: any = {};
          
          headers.forEach((header, index) => {
            if (header === 'name') beneficiary.name = values[index];
            else if (header === 'accountnumber') beneficiary.accountNumber = values[index];
            else if (header === 'ifsccode') beneficiary.ifscCode = values[index];
            else if (header === 'accounttype') beneficiary.accountType = values[index];
            else if (header === 'place') beneficiary.place = values[index];
            else if (header === 'email') beneficiary.email = values[index];
            else if (header === 'mobile') beneficiary.mobile = values[index];
          });
          
          if (!beneficiary.accountType) beneficiary.accountType = '10'; // Default
          if (!beneficiary.place) beneficiary.place = '';
          if (!beneficiary.email) beneficiary.email = '';
          if (!beneficiary.mobile) beneficiary.mobile = '';
          
          beneficiaries.push(beneficiary);
        }
        
        if (beneficiaries.length === 0) {
          setError('No valid beneficiaries found in the CSV file');
          return;
        }
        
        setPreview(beneficiaries);
      } catch (error) {
        setError('Error processing CSV file');
        console.error(error);
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      importBeneficiaries(preview);
      toast.success(`Imported ${preview.length} beneficiaries successfully`);
      setFile(null);
      setPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Beneficiaries</CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple beneficiaries at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-file"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} className="mr-2" />
              Browse
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            CSV should have columns: name, accountNumber, ifscCode, accountType, place, email, mobile
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertTriangle size={18} className="text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center mb-2">
              <CheckCircle2 size={18} className="text-green-500 mr-2" />
              <p className="text-green-700 font-medium">Ready to import {preview.length} beneficiaries</p>
            </div>
            <p className="text-sm text-green-600">
              First 3 entries: {preview.slice(0, 3).map(b => b.name).join(', ')}
              {preview.length > 3 && '...'}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFile(null);
            setPreview([]);
            setError(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        >
          Clear
        </Button>
        <Button
          type="button"
          className="bg-finance-primary"
          disabled={preview.length === 0}
          onClick={handleImport}
        >
          Import {preview.length} Beneficiaries
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CSVImport;
