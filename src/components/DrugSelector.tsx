
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drug } from '@/types/KnowledgeBase';

interface DrugSelectorProps {
  drugs: Drug[];
  selectedDrugId: string;
  onChange: (drugId: string) => void;
}

const DrugSelector = ({ drugs, selectedDrugId, onChange }: DrugSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="drug-selector" className="text-sm font-medium text-gray-700">
        Select Product:
      </label>
      <Select value={selectedDrugId} onValueChange={onChange}>
        <SelectTrigger id="drug-selector" className="w-[200px]">
          <SelectValue placeholder="Select a product" />
        </SelectTrigger>
        <SelectContent>
          {drugs.map((drug) => (
            <SelectItem key={drug.id} value={drug.id}>
              {drug.name} ({drug.company})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DrugSelector;
