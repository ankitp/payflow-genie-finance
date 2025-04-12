
import React, { useState, useEffect } from 'react';
import { Beneficiary } from '@/context/AppContext';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface BeneficiarySelectorProps {
  beneficiaries: Beneficiary[];
  selectedBeneficiaryId: string;
  onBeneficiarySelect: (id: string) => void;
}

const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
  beneficiaries,
  selectedBeneficiaryId,
  onBeneficiarySelect
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  // Filter beneficiaries based on search term
  const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
    if (!searchValue || searchValue.trim() === '') return true;
    
    const searchLower = searchValue.toLowerCase().trim();
    
    const nameMatch = beneficiary.name.toLowerCase().includes(searchLower);
    const accountMatch = beneficiary.accountNumber.toLowerCase().includes(searchLower);
    const ifscMatch = beneficiary.ifscCode.toLowerCase().includes(searchLower);
    
    return nameMatch || accountMatch || ifscMatch;
  });

  // Log filtered results when search changes for debugging
  useEffect(() => {
    console.log(`Search term: "${searchValue}"`);
    console.log(`Filtered beneficiaries count: ${filteredBeneficiaries.length}`);
    if (filteredBeneficiaries.length < 5) {
      console.log("Filtered results:", filteredBeneficiaries.map(b => b.name));
    }
  }, [searchValue, filteredBeneficiaries]);

  // Format account number to ensure it's displayed as a string without exponential notation
  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.toString().replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedBeneficiaryId ? (
            beneficiaries.find((b) => b.id === selectedBeneficiaryId)?.name || "Select beneficiary"
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
          <CommandList>
            <CommandGroup>
              {filteredBeneficiaries.map((beneficiary) => (
                <CommandItem
                  key={beneficiary.id}
                  value={beneficiary.id}
                  onSelect={() => {
                    onBeneficiarySelect(beneficiary.id);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBeneficiaryId === beneficiary.id ? "opacity-100" : "opacity-0"
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BeneficiarySelector;
