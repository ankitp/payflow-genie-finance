
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PaymentForm from '@/components/PaymentForm';
import PaymentList from '@/components/PaymentList';
import FileGenerator from '@/components/FileGenerator';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const Index = () => {
  const { payments, clearPayments } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleAddPayment = () => {
    // Increment key to reset the form
    setFormKey(prev => prev + 1);
  };

  const handleClearAll = () => {
    clearPayments();
    toast.success('All payment entries cleared');
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Payment Generator</h1>
          {payments.length > 0 && (
            <Button 
              variant="outline" 
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => setIsDialogOpen(true)}
            >
              <Trash size={16} className="mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PaymentForm key={formKey} onAddPayment={handleAddPayment} />
          </div>
          <div className="md:col-span-2 space-y-6">
            <PaymentList />
            <FileGenerator />
          </div>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will clear all payment entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Index;
