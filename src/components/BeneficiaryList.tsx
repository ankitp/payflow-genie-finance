
import React, { useState } from 'react';
import { useAppContext, Beneficiary } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface BeneficiaryListProps {
  onEdit: (beneficiary: Beneficiary) => void;
}

const BeneficiaryList: React.FC<BeneficiaryListProps> = ({ onEdit }) => {
  const { beneficiaries, deleteBeneficiary } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);

  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.accountNumber.includes(searchTerm) ||
    beneficiary.ifscCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (beneficiary: Beneficiary) => {
    setBeneficiaryToDelete(beneficiary);
  };

  const confirmDelete = () => {
    if (beneficiaryToDelete) {
      deleteBeneficiary(beneficiaryToDelete.id);
      toast.success('Beneficiary deleted successfully');
      setBeneficiaryToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center relative">
        <Search className="absolute left-3 text-gray-400" size={18} />
        <Input
          placeholder="Search beneficiaries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Beneficiary Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>IFSC Code</TableHead>
              <TableHead>Place</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBeneficiaries.length > 0 ? (
              filteredBeneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id}>
                  <TableCell className="font-medium">{beneficiary.name}</TableCell>
                  <TableCell>{beneficiary.accountNumber}</TableCell>
                  <TableCell>{beneficiary.ifscCode}</TableCell>
                  <TableCell>{beneficiary.place}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(beneficiary)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(beneficiary)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No beneficiaries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!beneficiaryToDelete} onOpenChange={() => setBeneficiaryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the beneficiary
              <strong> {beneficiaryToDelete?.name}</strong> and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BeneficiaryList;
