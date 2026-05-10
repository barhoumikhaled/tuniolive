"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface SupplierLike {
  id: number;
  name: string;
  country?: string | null;
}

interface SupplierComboboxProps {
  contacts: SupplierLike[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SupplierCombobox({ contacts, value, onChange, placeholder = "Select supplier" }: SupplierComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = contacts.find((c) => String(c.id) === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}
        >
          {selected ? selected.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search suppliers..." />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>No supplier found.</CommandEmpty>
            <CommandGroup>
              {contacts.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => {
                    onChange(String(c.id));
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === String(c.id) ? "opacity-100" : "opacity-0")} />
                  {c.name}
                  {c.country && <span className="ml-auto text-xs text-muted-foreground">{c.country}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
