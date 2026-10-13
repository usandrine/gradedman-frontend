'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

// Dropdown with label and error. With react-hook-form, wrap it in a <Controller>:
// <Controller name="x" control={control} render={({ field }) => <SelectField {...field} ... />} />
export function SelectField({ label, value, onChange, options, placeholder, error, disabled, id }: SelectFieldProps) {
  return (
    <FormField label={label} htmlFor={id} error={error}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} aria-invalid={!!error} className="w-full data-[size=default]:h-11">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
