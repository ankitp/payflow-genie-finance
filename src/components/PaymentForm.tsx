
import React, { useState, useEffect } from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import BeneficiarySelector from './BeneficiarySelector';
import BeneficiaryDetails from './BeneficiaryDetails';

interface PaymentFormProps {
  onAddPayment: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onAddPayment }) => {
  const { beneficiaries, addPayment } = useAppContext();
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [beneficiaryDetails, setBeneficiaryDetails] = useState<Beneficiary | null>(null);

  // Update beneficiary details when selection changes
  useEffect(() => {
    if (selectedBeneficiaryId) {
      const beneficiary = beneficiaries.find(b => b.id === selectedBeneficiaryId);
      if (beneficiary) {
        setBeneficiaryDetails(beneficiary);
      }
    } else {
      setBeneficiaryDetails(null);
    }
  }, [selectedBeneficiaryId, beneficiaries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBeneficiaryId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please select a beneficiary and enter a valid amount');
      return;
    }
    
    addPayment({
      beneficiaryId: selectedBeneficiaryId,
      amount: Number(amount),
    });
    
    // Reset form
    setSelectedBeneficiaryId('');
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
            <BeneficiarySelector 
              beneficiaries={beneficiaries}
              selectedBeneficiaryId={selectedBeneficiaryId}
              onBeneficiarySelect={setSelectedBeneficiaryId}
            />
          </div>
          
          {beneficiaryDetails && (
            <BeneficiaryDetails beneficiary={beneficiaryDetails} />
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
