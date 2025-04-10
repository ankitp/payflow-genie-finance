
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileDown, FileText } from 'lucide-react';
import { toast } from 'sonner';

const FileGenerator: React.FC = () => {
  const { payments, beneficiaries } = useAppContext();

  const generatePaymentFile = () => {
    if (payments.length === 0) {
      toast.error('No payment entries to generate file');
      return;
    }

    try {
      // Process payments to create file content
      const fileContent = payments.map(payment => {
        const beneficiary = beneficiaries.find(b => b.id === payment.beneficiaryId);
        
        if (!beneficiary) {
          throw new Error(`Beneficiary not found for payment: ${payment.id}`);
        }

        // Determine payment method (NEFT or RTGS) based on amount
        const paymentMethod = payment.amount < 200000 ? 'NEFT' : 'RTGS';
        
        // Format the line according to specifications
        return [
          paymentMethod,                // 1. Payment method
          'ABHAYAEXPORTSPVTLTD',        // 2. Static value
          payment.amount,               // 3. Amount
          beneficiary.ifscCode,         // 4. IFSC Code
          beneficiary.name,             // 5. Beneficiary name
          beneficiary.accountNumber,    // 6. Account number
          beneficiary.accountType,      // 7. Account type
          beneficiary.place,            // 8. Place
          beneficiary.email,            // 9. Email
          beneficiary.mobile,           // 10. Mobile
          'E',                          // 11. Static 'E'
          'Payment',                    // 12. Static 'Payment'
          '90909',                      // 13. Static value
          'Remarks'                     // 14. Static 'Remarks'
        ].join('|');
      }).join('\n');

      // Create blob and download
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment_file_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Payment file generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating payment file:', error);
      toast.error('Failed to generate payment file');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Payment File</CardTitle>
        <CardDescription>
          Create a text file for bank payment processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            The file will be generated in the specific format required by your bank:
          </p>
          <p className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto whitespace-nowrap">
            NEFT|ABHAYAEXPORTSPVTLTD|100000|FDRL0005555|AMIT SHUKLA|55550103142988|10|MUMBAI|email@example.com|9876543210|E|Payment|90909|Remarks
          </p>
          <div className="pt-2">
            <p className="text-sm font-medium">File will contain {payments.length} payment entries</p>
            <p className="text-xs text-muted-foreground">
              {payments.length === 0 
                ? "Add payment entries before generating the file" 
                : `Total amount: ₹${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}`
              }
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted rounded-b-lg p-4">
        <Button 
          className="w-full bg-finance-primary" 
          onClick={generatePaymentFile}
          disabled={payments.length === 0}
        >
          <FileDown size={16} className="mr-2" />
          Generate and Download Payment File
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileGenerator;
