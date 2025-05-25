
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComboboxItem {
  label: string;
  value: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  placeholder?: string;
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function Combobox({
  items = [],
  placeholder = "Select an item...",
  value,
  onChange,
  className,
}: ComboboxProps) {
  console.log('Combobox received items:', items);
  
  // Enhanced safety: Ensure items is always a valid array
  const safeItems = Array.isArray(items) ? 
    items.filter(item => item && typeof item === 'object' && item.value && item.label) : 
    [];
  
  console.log('Safe items after filtering:', safeItems);
  
  // Show loading state if items is undefined or null
  if (items === undefined || items === null) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
          <span className="text-muted-foreground">Loading...</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </div>
    );
  }

  // Early return with disabled state if no safe items
  if (safeItems.length === 0) {
    console.log('No safe items found, rendering disabled select');
    return (
      <div className={cn("w-full", className)}>
        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
          <span className="text-muted-foreground">{placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {safeItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            <div className="flex items-center">
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === item.value ? "opacity-100" : "opacity-0"
                )}
              />
              {item.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
