
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types
export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  place: string;
  email: string;
  mobile: string;
}

export interface Payment {
  id: string;
  beneficiaryId: string;
  amount: number;
}

interface AppContextType {
  beneficiaries: Beneficiary[];
  payments: Payment[];
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id'>) => void;
  updateBeneficiary: (id: string, beneficiary: Partial<Beneficiary>) => void;
  deleteBeneficiary: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  clearPayments: () => void;
  importBeneficiaries: (beneficiaries: Omit<Beneficiary, 'id'>[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage if available
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const savedBeneficiaries = localStorage.getItem('beneficiaries');
    return savedBeneficiaries ? JSON.parse(savedBeneficiaries) : [
      {
        id: '1',
        name: 'AMIT SHUKLA',
        accountNumber: '55550103142988',
        ifscCode: 'FDRL0005555',
        accountType: '10',
        place: 'MUMBAI',
        email: 'mona.abhaayexports@gmail.com',
        mobile: '8424972444'
      },
      {
        id: '2',
        name: 'RAJESH KUMAR',
        accountNumber: '38651427890',
        ifscCode: 'SBIN0001234',
        accountType: '10',
        place: 'DELHI',
        email: 'rajesh.kumar@example.com',
        mobile: '9876543210'
      }
    ];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const savedPayments = localStorage.getItem('payments');
    return savedPayments ? JSON.parse(savedPayments) : [];
  });

  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  // Beneficiary CRUD operations
  const addBeneficiary = (beneficiary: Omit<Beneficiary, 'id'>) => {
    const newBeneficiary = {
      ...beneficiary,
      id: Date.now().toString(),
    };
    setBeneficiaries(prev => [...prev, newBeneficiary]);
  };

  const updateBeneficiary = (id: string, beneficiary: Partial<Beneficiary>) => {
    setBeneficiaries(prev =>
      prev.map(item => (item.id === id ? { ...item, ...beneficiary } : item))
    );
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries(prev => prev.filter(item => item.id !== id));
    setPayments(prev => prev.filter(payment => payment.beneficiaryId !== id));
  };

  const importBeneficiaries = (newBeneficiaries: Omit<Beneficiary, 'id'>[]) => {
    const newBeneficiariesWithIds = newBeneficiaries.map(beneficiary => ({
      ...beneficiary,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    setBeneficiaries(prev => [...prev, ...newBeneficiariesWithIds]);
  };

  // Payment CRUD operations
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    setPayments(prev =>
      prev.map(item => (item.id === id ? { ...item, ...payment } : item))
    );
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(item => item.id !== id));
  };

  const clearPayments = () => {
    setPayments([]);
  };

  return (
    <AppContext.Provider
      value={{
        beneficiaries,
        payments,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        addPayment,
        updatePayment,
        deletePayment,
        clearPayments,
        importBeneficiaries,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
