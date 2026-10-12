import { z } from 'zod';
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/lib/constants';

export const materialFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ACCEPTED_FILE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)),
    'Only PDF and DOCX files are allowed'
  )
  .refine((file) => file.size > 0, 'This file is empty')
  .refine(
    (file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
    `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`
  );
