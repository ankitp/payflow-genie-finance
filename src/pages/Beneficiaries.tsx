
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import BeneficiaryForm from '@/components/BeneficiaryForm';
import BeneficiaryList from '@/components/BeneficiaryList';
import CSVImport from '@/components/CSVImport';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beneficiary } from '@/context/AppContext';
import ExcelImport from '@/components/ExcelImport';

const Beneficiaries = () => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<Beneficiary | undefined>(undefined);

  const handleEdit = (beneficiary: Beneficiary) => {
    setBeneficiaryToEdit(beneficiary);
    setActiveTab('add');
  };

  const handleCancel = () => {
    setBeneficiaryToEdit(undefined);
    setActiveTab('list');
    setIsAdding(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Beneficiary Management</h1>
          {activeTab === 'list' && !isAdding && (
            <div className="flex space-x-2">
              <Button onClick={() => setActiveTab('csv')} variant="outline">
                <Upload size={16} className="mr-2" />
                Import CSV
              </Button>
              <Button onClick={() => setActiveTab('excel')} variant="outline">
                <FileSpreadsheet size={16} className="mr-2" />
                Import Excel
              </Button>
              <Button onClick={() => setIsAdding(true)} className="bg-finance-primary">
                <Plus size={16} className="mr-2" />
                Add Beneficiary
              </Button>
            </div>
          )}
        </div>

        {isAdding ? (
          <BeneficiaryForm onCancel={handleCancel} beneficiaryToEdit={beneficiaryToEdit} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Beneficiary List</TabsTrigger>
              <TabsTrigger value="csv">Import CSV</TabsTrigger>
              <TabsTrigger value="excel">Import Excel</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <BeneficiaryList onEdit={handleEdit} />
            </TabsContent>
            <TabsContent value="csv" className="mt-4">
              <CSVImport />
            </TabsContent>
            <TabsContent value="excel" className="mt-4">
              <ExcelImport />
            </TabsContent>
            <TabsContent value="add" className="mt-4">
              <BeneficiaryForm 
                onCancel={handleCancel} 
                beneficiaryToEdit={beneficiaryToEdit}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Beneficiaries;
