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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeneficiaryFormProps {
  onCancel: () => void;
  beneficiaryToEdit?: Beneficiary;
}

const accountTypes = [
  { value: "10", label: "Saving Account" },
  { value: "11", label: "Current Account" },
  { value: "other", label: "Other" }
];

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (formData.accountNumber) {
      setFormattedAccountNumber(formatAccountNumber(formData.accountNumber));
    }
  }, [formData.accountNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'accountNumber') {
      const rawValue = value.replace(/\s/g, '');
      setFormData(prev => ({ ...prev, [name]: rawValue }));
      setFormattedAccountNumber(formatAccountNumber(rawValue));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAccountTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, accountType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const formatAccountNumber = (accountNumber: string): string => {
    return accountNumber.replace(/(.{4})/g, "$1 ").trim();
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {formData.accountType
                      ? accountTypes.find((type) => type.value === formData.accountType)?.label
                      : "Select account type"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search account type..." />
                    <CommandEmpty>No account type found.</CommandEmpty>
                    <CommandGroup>
                      {accountTypes.map((type) => (
                        <CommandItem
                          key={type.value}
                          value={type.value}
                          onSelect={(value) => {
                            handleAccountTypeChange(value);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.accountType === type.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
