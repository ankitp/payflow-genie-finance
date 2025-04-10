
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
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
  onAddPayment: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onAddPayment }) => {
  const { beneficiaries, addPayment } = useAppContext();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [beneficiaryDetails, setBeneficiaryDetails] = useState<Beneficiary | null>(null);

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
    
    toast.success('Payment added successfully');
    onAddPayment();
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
            <Select
              value={selectedBeneficiary}
              onValueChange={setSelectedBeneficiary}
            >
              <SelectTrigger id="beneficiary">
                <SelectValue placeholder="Select a beneficiary" />
              </SelectTrigger>
              <SelectContent>
                {beneficiaries.map(beneficiary => (
                  <SelectItem key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {beneficiaryDetails && (
            <div className="p-3 bg-finance-border rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-sm font-medium">{beneficiaryDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">IFSC Code</p>
                  <p className="text-sm font-medium">{beneficiaryDetails.ifscCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Account Type</p>
                  <p className="text-sm font-medium">{beneficiaryDetails.accountType}</p>
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
