
import React, { useState, useEffect } from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { toast } from 'sonner';

interface BeneficiaryFormProps {
  onCancel: () => void;
  beneficiaryToEdit?: Beneficiary;
}

const BeneficiaryForm: React.FC<BeneficiaryFormProps> = ({ onCancel, beneficiaryToEdit }) => {
  const { addBeneficiary, updateBeneficiary } = useAppContext();
  const [formData, setFormData] = useState<Omit<Beneficiary, 'id'>>({
    name: beneficiaryToEdit?.name || '',
    accountNumber: beneficiaryToEdit?.accountNumber || '',
    ifscCode: beneficiaryToEdit?.ifscCode || '',
    accountType: beneficiaryToEdit?.accountType || '',
    place: beneficiaryToEdit?.place || '',
    email: beneficiaryToEdit?.email || '',
    mobile: beneficiaryToEdit?.mobile || '',
  });
  
  const [formattedAccountNumber, setFormattedAccountNumber] = useState('');

  useEffect(() => {
    if (beneficiaryToEdit?.accountNumber) {
      // Format the account number for display
      setFormattedAccountNumber(formatAccountNumber(beneficiaryToEdit.accountNumber));
    }
  }, [beneficiaryToEdit]);

  // Format account number with spaces every 4 digits
  const formatAccountNumber = (value: string): string => {
    // Remove any existing spaces first
    const cleanValue = value.replace(/\s/g, '');
    // Add a space after every 4 digits
    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'accountNumber') {
      // Remove spaces for storing the actual value
      const cleanValue = value.replace(/\s/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      
      // Format with spaces for display
      setFormattedAccountNumber(formatAccountNumber(cleanValue));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAccountTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, accountType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.accountNumber || !formData.ifscCode || !formData.accountType) {
      toast.error('Please fill all required fields');
      return;
    }

    if (beneficiaryToEdit) {
      updateBeneficiary(beneficiaryToEdit.id, formData);
      toast.success('Beneficiary updated successfully');
    } else {
      addBeneficiary(formData);
      toast.success('Beneficiary added successfully');
    }
    
    onCancel();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{beneficiaryToEdit ? 'Edit Beneficiary' : 'Add New Beneficiary'}</CardTitle>
          <CardDescription>
            Enter the beneficiary's bank account details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Beneficiary Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter beneficiary name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="Enter account number"
                value={formattedAccountNumber}
                onChange={handleChange}
                required
                className="font-mono"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code *</Label>
              <Input
                id="ifscCode"
                name="ifscCode"
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                value={formData.accountType}
                onValueChange={handleAccountTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Saving Account</SelectItem>
                  <SelectItem value="11">Current Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                name="place"
                placeholder="Enter place"
                value={formData.place}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              name="mobile"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-finance-primary">
            {beneficiaryToEdit ? 'Update Beneficiary' : 'Add Beneficiary'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BeneficiaryForm;
