
import React, { useState } from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.accountNumber || !formData.ifscCode) {
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
                value={formData.accountNumber}
                onChange={handleChange}
                required
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
              <Input
                id="accountType"
                name="accountType"
                placeholder="Enter account type"
                value={formData.accountType}
                onChange={handleChange}
                required
              />
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
