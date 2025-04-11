
import React, { useState, useEffect } from 'react';
import { useAppContext, Beneficiary, Payment } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  onAddPayment: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onAddPayment }) => {
  const { beneficiaries, addPayment } = useAppContext();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [beneficiaryDetails, setBeneficiaryDetails] = useState<Beneficiary | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);

  // Filter beneficiaries when search value changes
  useEffect(() => {
    const searchLower = searchValue.toLowerCase();
    const filtered = beneficiaries.filter(beneficiary => {
      return (
        beneficiary.name.toLowerCase().includes(searchLower) ||
        beneficiary.accountNumber.includes(searchValue) ||
        beneficiary.ifscCode.toLowerCase().includes(searchLower)
      );
    });
    setFilteredBeneficiaries(filtered);
  }, [searchValue, beneficiaries]);

  // Update beneficiary details when selection changes
  useEffect(() => {
    if (selectedBeneficiary) {
      const beneficiary = beneficiaries.find(b => b.id === selectedBeneficiary);
      if (beneficiary) {
        setBeneficiaryDetails(beneficiary);
      }
    } else {
      setBeneficiaryDetails(null);
    }
  }, [selectedBeneficiary, beneficiaries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBeneficiary || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please select a beneficiary and enter a valid amount');
      return;
    }
    
    addPayment({
      beneficiaryId: selectedBeneficiary,
      amount: Number(amount),
    });
    
    // Reset form
    setSelectedBeneficiary('');
    setAmount('');
    setBeneficiaryDetails(null);
    setSearchValue('');
    
    toast.success('Payment added successfully');
    onAddPayment();
  };

  const getAccountTypeDisplay = (accountType: string) => {
    if (accountType === "10") return "Saving Account";
    if (accountType === "11") return "Current Account";
    return accountType;
  };

  // Format account number to ensure it's displayed as a string without exponential notation
  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.toString();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add Payment</CardTitle>
          <CardDescription>
            Select a beneficiary and enter payment amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary</Label>
            <div className="relative">
              <div className="mb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search beneficiary..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select
                value={selectedBeneficiary}
                onValueChange={setSelectedBeneficiary}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a beneficiary" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredBeneficiaries.length > 0 ? (
                    filteredBeneficiaries.map((beneficiary) => (
                      <SelectItem 
                        key={beneficiary.id} 
                        value={beneficiary.id}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="font-medium">{beneficiary.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatAccountNumber(beneficiary.accountNumber)}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No beneficiary found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {beneficiaryDetails && (
            <div className="p-3 bg-finance-border rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-sm font-medium font-mono">{formatAccountNumber(beneficiaryDetails.accountNumber)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IFSC Code</p>
                  <p className="text-sm font-medium">{beneficiaryDetails.ifscCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Account Type</p>
                  <p className="text-sm font-medium">{getAccountTypeDisplay(beneficiaryDetails.accountType)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Place</p>
                  <p className="text-sm font-medium">{beneficiaryDetails.place}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter payment amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-finance-primary">
            <Plus size={16} className="mr-2" />
            Add Payment
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PaymentForm;
