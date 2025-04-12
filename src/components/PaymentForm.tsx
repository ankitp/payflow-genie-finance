
import React, { useState, useEffect } from 'react';
import { useAppContext, Beneficiary, Payment } from '@/context/AppContext';
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
import { Plus, Search, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface PaymentFormProps {
  onAddPayment: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onAddPayment }) => {
  const { beneficiaries, addPayment } = useAppContext();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [beneficiaryDetails, setBeneficiaryDetails] = useState<Beneficiary | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Filter beneficiaries based on search term
  const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
    const searchLower = searchValue.toLowerCase();
    return (
      beneficiary.name.toLowerCase().includes(searchLower) ||
      beneficiary.accountNumber.includes(searchValue) ||
      beneficiary.ifscCode.toLowerCase().includes(searchLower)
    );
  });

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
    return accountNumber.toString().replace(/(.{4})/g, "$1 ").trim();
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
            <Popover open={commandOpen} onOpenChange={setCommandOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={commandOpen}
                  className="w-full justify-between"
                >
                  {selectedBeneficiary ? (
                    beneficiaries.find((b) => b.id === selectedBeneficiary)?.name || "Select beneficiary"
                  ) : (
                    "Select beneficiary"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput 
                      placeholder="Search beneficiary..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="h-9"
                    />
                  </div>
                  <CommandEmpty>No beneficiary found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {filteredBeneficiaries.map((beneficiary) => (
                      <CommandItem
                        key={beneficiary.id}
                        value={beneficiary.id}
                        onSelect={() => {
                          setSelectedBeneficiary(beneficiary.id);
                          setCommandOpen(false);
                        }}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="flex items-center w-full">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBeneficiary === beneficiary.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{beneficiary.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {formatAccountNumber(beneficiary.accountNumber)}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
