'use client';

import { useState } from 'react';
import { FileText, Loader2, RotateCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { formatDate, formatFileSize } from '@/lib/format';
import type { Material, MaterialStatus } from '@/lib/features/materials/materialsSlice';

const statusStyles: Record<MaterialStatus, { label: string; className: string }> = {
  uploaded: { label: 'Uploaded', className: 'bg-brand-100 text-brand-700' },
  processing: { label: 'Processing', className: 'bg-yellow-100 text-yellow-700' },
  ready: { label: 'Ready', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
};

export function MaterialStatusBadge({ status }: { status: MaterialStatus }) {
  const { label, className } = statusStyles[status];

  return (
    <Badge variant="secondary" className={className}>
      {status === 'processing' && <Loader2 className="animate-spin" />}
      {label}
    </Badge>
  );
}

// One line under the file name explaining where the document is in the AI pipeline
function statusDetail(material: Material): string | null {
  switch (material.status) {
    case 'processing':
      return 'Processing document — reading the text and preparing it for AI...';
    case 'ready':
      return `Ready for question generation · ${material.chunk_count} text ${material.chunk_count === 1 ? 'chunk' : 'chunks'}`;
    case 'failed':
      return material.error_message ?? 'This file could not be processed.';
    default:
      return null;
  }
}

interface MaterialActions {
  onDelete: (id: number) => Promise<unknown>;
  onRetry: (id: number) => Promise<unknown>;
}

function MaterialRow({ material, onDelete, onRetry }: { material: Material } & MaterialActions) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const detail = statusDetail(material);

  const run = async (action: (id: number) => Promise<unknown>) => {
    setBusy(true);
    await action(material.id);
    // After a successful delete this row is already gone; otherwise reset it
    setBusy(false);
    setConfirming(false);
  };

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
        <FileText className="size-5 text-brand-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-950">{material.original_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(material.size)} · {formatDate(material.created_at)}
        </p>
        {detail && (
          <p className={material.status === 'failed' ? 'mt-0.5 text-xs text-destructive' : 'mt-0.5 text-xs text-muted-foreground'}>
            {detail}
          </p>
        )}
      </div>

      <MaterialStatusBadge status={material.status} />

      {confirming ? (
        <div className="flex items-center gap-1">
          <LoadingButton variant="destructive" size="sm" loading={busy} onClick={() => run(onDelete)}>
            Delete
          </LoadingButton>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          {material.status === 'failed' && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Process ${material.original_name} again`}
              title="Try again"
              disabled={busy}
              onClick={() => run(onRetry)}
              className="text-gray-400 hover:text-primary"
            >
              <RotateCw className={busy ? 'animate-spin' : undefined} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${material.original_name}`}
            title="Delete"
            onClick={() => setConfirming(true)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </li>
  );
}

export function MaterialList({ materials, ...actions }: { materials: Material[] } & MaterialActions) {
  return (
    <ul className="divide-y divide-gray-100">
      {materials.map((material) => (
        <MaterialRow key={material.id} material={material} {...actions} />
      ))}
    </ul>
  );
}
