'use client';

import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clearUploadError, uploadMaterial } from '@/lib/features/materials/materialsSlice';
import { materialFileSchema } from '@/lib/validations/material';
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/lib/constants';
import { formatFileSize } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { FormAlert } from '@/components/shared/FormAlert';
import { LoadingButton } from '@/components/shared/LoadingButton';

// Pick a file → check it → send it to the backend, with progress and result messages
export function MaterialUploader() {
  const dispatch = useAppDispatch();
  const { uploading, uploadProgress, uploadError } = useAppSelector((state) => state.materials);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSelect = (selected: File) => {
    dispatch(clearUploadError());
    setSuccess(null);

    const result = materialFileSchema.safeParse(selected);
    if (!result.success) {
      setFile(null);
      setFileError(result.error.issues[0].message);
      return;
    }

    setFileError(null);
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    const result = await dispatch(uploadMaterial(file));

    if (uploadMaterial.fulfilled.match(result)) {
      setSuccess(`"${result.payload.original_name}" was uploaded. It is now being processed — you can follow it below.`);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropzone
        accept={ACCEPTED_FILE_EXTENSIONS}
        maxSizeMB={MAX_FILE_SIZE_MB}
        onFileSelect={handleSelect}
        disabled={uploading}
      />

      <FormAlert message={fileError ?? uploadError} />
      <FormAlert message={success} variant="success" />

      {file && (
        <div className="space-y-3 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <FileText className="size-5 text-brand-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-950">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove selected file"
              disabled={uploading}
              onClick={() => setFile(null)}
            >
              <X />
            </Button>
            <LoadingButton loading={uploading} loadingText={`Uploading ${uploadProgress}%`} onClick={handleUpload}>
              Upload
            </LoadingButton>
          </div>

          {uploading && <Progress value={uploadProgress} />}
        </div>
      )}
    </div>
  );
}
