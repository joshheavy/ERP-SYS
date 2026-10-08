'use client';

import React, { useRef, useState } from 'react';
import { FileTextIcon, TrashIcon, UploadCloudIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { ProgressBar } from './Progress';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  error?: string;
}

export interface FileUploadProps {
  label: string;
  hint?: string;
  files: UploadedFile[];
  onAdd: (names: string[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  label,
  hint = 'PDF, XLSX or CSV up to 10 MB',
  files,
  onAdd,
  onRemove,
  disabled,
  className
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    onAdd(Array.from(list).map((f) => f.name));
  };

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-control border border-dashed px-4 py-6 text-center',
          'transition-[border-color,background-color] duration-fast ease-exit',
          dragging ? 'border-primary bg-primary-soft' : 'border-line-strong bg-surface-2',
          disabled && 'opacity-50'
        )}>

        <UploadCloudIcon className="h-5 w-5 text-ink-subtle" aria-hidden />
        <p className="mt-2 text-body text-ink">{label}</p>
        <p className="mt-0.5 text-small text-ink-muted">{hint}</p>
        <Button
          className="mt-3"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}>

          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          aria-label={label}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)} />

      </div>

      {files.length > 0 &&
        <ul className="mt-2 divide-y divide-line rounded-control border border-line">
          {files.map((file) =>
            <li key={file.id} className="flex items-center gap-3 px-2.5 py-2">
              <FileTextIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{file.name}</p>
                {file.error ?
                  <p className="text-caption text-danger">{file.error}</p> :
                  file.progress < 100 ?
                    <ProgressBar className="mt-1" size="sm" value={file.progress} max={100} /> :

                    <p className="tabular text-caption text-ink-subtle">{file.size} · uploaded</p>
                }
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={TrashIcon}
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemove(file.id)} />

            </li>
          )}
        </ul>
      }
    </div>);

}