
import React from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentList: React.FC = () => {
  const { payments, beneficiaries, deletePayment } = useAppContext();

  // Function to get beneficiary by ID
  const getBeneficiary = (id: string): Beneficiary | undefined => {
    return beneficiaries.find(b => b.id === id);
  };

  // Function to determine if payment method should be NEFT or RTGS
  const getPaymentMethod = (amount: number): string => {
    return amount < 200000 ? 'NEFT' : 'RTGS';
  };

  // Function to ensure account numbers display properly without scientific notation
  const formatAccountNumber = (accountNumber: string) => {
    // Format the account number with spaces for readability
    return accountNumber.replace(/(\d)(?=(\d{4})+(?!\d))/g, '$1 ');
  };

  // Get account type display
  const getAccountTypeDisplay = (accountType: string) => {
    if (accountType === "10") return "Saving Account";
    if (accountType === "11") return "Current Account";
    return accountType;
  };

  // Calculate total amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Entries</CardTitle>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total Amount</div>
          <div className="text-xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Type</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="w-[220px]">Account Number</TableHead>
                <TableHead>IFSC Code</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => {
                  const beneficiary = getBeneficiary(payment.beneficiaryId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          getPaymentMethod(payment.amount) === 'NEFT' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {getPaymentMethod(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {beneficiary?.name || 'Unknown Beneficiary'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {payment.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="font-mono">
                        {beneficiary ? formatAccountNumber(beneficiary.accountNumber) : 'N/A'}
                      </TableCell>
                      <TableCell>{beneficiary?.ifscCode || 'N/A'}</TableCell>
                      <TableCell>
                        {beneficiary ? getAccountTypeDisplay(beneficiary.accountType) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePayment(payment.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No payment entries added. Use the form to add payments.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentList;
