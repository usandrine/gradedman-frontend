'use client';

import { useEffect } from 'react';
import { FolderOpen, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  deleteMaterial,
  fetchMaterials,
  isProcessing,
  refreshMaterials,
  reprocessMaterial,
} from '@/lib/features/materials/materialsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialList } from '@/components/materials/MaterialList';
import { MaterialUploader } from '@/components/materials/MaterialUploader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormAlert } from '@/components/shared/FormAlert';
import { PageHeader } from '@/components/shared/PageHeader';

const POLL_INTERVAL_MS = 3000;

export default function UploadMaterialsPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.materials);

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  // While any document is being processed, keep checking for its new status
  const hasProcessing = items.some(isProcessing);

  useEffect(() => {
    if (!hasProcessing) return;

    const timer = setInterval(() => dispatch(refreshMaterials()), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasProcessing, dispatch]);

  const isFirstLoad = status === 'loading' && items.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Upload Materials"
        description="Add the notes you want your exam questions to be generated from."
      />

      <Card>
        <CardHeader>
          <CardTitle>New material</CardTitle>
          <CardDescription>Choose one file at a time.</CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialUploader />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your materials {items.length > 0 && `(${items.length})`}</CardTitle>
          <CardDescription>
            Each file is read and prepared for AI after upload. Once it shows Ready, it can be used to generate questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormAlert message={error} className="mb-3" />

          {isFirstLoad ? (
            <Loader2 className="mx-auto my-8 size-6 animate-spin text-primary" />
          ) : items.length === 0 ? (
            status !== 'failed' && (
              <EmptyState
                icon={FolderOpen}
                title="No materials yet"
                description="Files you upload will appear here."
              />
            )
          ) : (
            <MaterialList
              materials={items}
              onDelete={(id) => dispatch(deleteMaterial(id))}
              onRetry={(id) => dispatch(reprocessMaterial(id))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
