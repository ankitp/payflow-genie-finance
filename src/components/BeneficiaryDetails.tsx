
import React from 'react';
import { Beneficiary } from '@/context/AppContext';

interface BeneficiaryDetailsProps {
  beneficiary: Beneficiary;
}

const BeneficiaryDetails: React.FC<BeneficiaryDetailsProps> = ({ beneficiary }) => {
  // Format account number to ensure it's displayed as a string without exponential notation
  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.toString().replace(/(.{4})/g, "$1 ").trim();
  };

  const getAccountTypeDisplay = (accountType: string) => {
    if (accountType === "10") return "Saving Account";
    if (accountType === "11") return "Current Account";
    return accountType;
  };

  return (
    <div className="p-3 bg-finance-border rounded-md space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Account Number</p>
          <p className="text-sm font-medium font-mono">{formatAccountNumber(beneficiary.accountNumber)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">IFSC Code</p>
          <p className="text-sm font-medium">{beneficiary.ifscCode}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Account Type</p>
          <p className="text-sm font-medium">{getAccountTypeDisplay(beneficiary.accountType)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Place</p>
          <p className="text-sm font-medium">{beneficiary.place}</p>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDetails;
