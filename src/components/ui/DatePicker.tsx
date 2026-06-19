'use client';

import { useState, useCallback } from 'react';
import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  name?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function DatePicker({ value, onChange, name, placeholder = 'Pick a date', className, required }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  const handleSelect = useCallback((d: Date | undefined) => {
    if (d) {
      const formatted = format(d, 'yyyy-MM-dd');
      onChange?.(formatted);
      setOpen(false);
    }
  }, [onChange]);

  return (
    <>
      {name && <input type="hidden" name={name} value={value || ''} required={required} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            'inline-flex items-center justify-start gap-2 h-9 w-full rounded-md border border-input bg-card px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {value ? (
            <span>{format(date!, 'MMM dd, yyyy')}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleSelect} autoFocus />
        </PopoverContent>
      </Popover>
    </>
  );
}
