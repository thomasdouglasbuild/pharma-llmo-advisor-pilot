
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const [open, setOpen] = useState(false);
  
  // Enhanced safety: Ensure items is always a valid array and handle edge cases
  const safeItems = Array.isArray(items) ? 
    items.filter(item => item && typeof item === 'object' && item.value && item.label) : 
    [];
  
  console.log('Combobox received items:', items);
  console.log('Safe items after filtering:', safeItems);
  
  // Find the selected item (with enhanced safety check)
  const selectedItem = safeItems.find((item) => item && item.value === value);

  // Early return with a simple button if no safe items
  if (safeItems.length === 0) {
    console.log('No safe items found, rendering disabled button');
    return (
      <Button
        variant="outline"
        role="combobox"
        className={cn("w-full justify-between", className)}
        disabled
      >
        {placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-white border shadow-lg z-50">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {safeItems.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  console.log('Item selected:', item.value);
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
