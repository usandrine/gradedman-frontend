'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  // Allowed extensions, e.g. ['.pdf', '.docx']
  accept: string[];
  maxSizeMB: number;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

// Click-or-drag file picker. Validation is left to the caller via onFileSelect.
export function FileDropzone({ accept, maxSizeMB, onFileSelect, disabled = false }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) onFileSelect(files[0]);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
        dragging ? 'border-primary bg-brand-50' : 'border-gray-300 hover:border-primary hover:bg-brand-50/40'
      )}
    >
      <UploadCloud className="size-10 text-primary" />
      <p className="mt-3 text-sm font-medium text-brand-950">
        <span className="text-primary">Click to choose a file</span> or drag and drop it here
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {accept.map((ext) => ext.replace('.', '').toUpperCase()).join(' or ')} — up to {maxSizeMB}MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          // Reset so choosing the same file again still fires onChange
          event.target.value = '';
        }}
      />
    </button>
  );
}
