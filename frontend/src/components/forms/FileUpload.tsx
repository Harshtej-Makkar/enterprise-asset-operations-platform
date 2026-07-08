import { ImagePlus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  /** The current photo URL (server-stored). null when no file chosen yet. */
  value: string | null;
  /** Called with the uploaded file URL (or null when removed). */
  onChange: (url: string | null) => void;
  /**
   * Called when a new file is dropped. The parent is expected to upload
   * it to the server and then call onChange with the resulting URL.
   * This decouples the component from the upload mechanism.
   */
  onUpload: (file: File) => Promise<string>;
  /** When true, the upload is in progress and an overlay is shown */
  isUploading?: boolean;
  /** Optional max file size in bytes. Default 5MB. */
  maxSize?: number;
  /** Optional accepted MIME types. Default: image only. */
  accept?: Accept;
  label?: string;
  className?: string;
  /** Optional error message to show beneath the dropzone */
  error?: string;
}

const DEFAULT_ACCEPT: Accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] };

/**
 * Image upload with drag-and-drop and preview.
 *
 * The component does NOT upload files itself. It exposes a file via the
 * `onUpload` callback; the parent calls the backend and then passes the
 * resulting URL back through `onChange`. This keeps the upload mechanism
 * (FormData, multer, S3, whatever) out of the component.
 */
export function FileUpload({
  value,
  onChange,
  onUpload,
  isUploading = false,
  maxSize = 5 * 1024 * 1024,
  accept = DEFAULT_ACCEPT,
  label = 'Photo (required when marked)',
  className,
  error,
}: FileUploadProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    // Clear the internal error when the value resets (successful upload
    // or removal).
    if (!value) setInternalError(null);
  }, [value]);

  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[]) => {
      setInternalError(null);
      if (rejections.length > 0) {
        setInternalError(rejections[0].errors[0]?.message ?? 'File rejected');
        return;
      }
      const file = accepted[0];
      if (!file) return;
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (e) {
        setInternalError(e instanceof Error ? e.message : 'Upload failed');
      }
    },
    [onChange, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  const showError = error ?? internalError;

  if (value) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="relative overflow-hidden rounded-sm border border-border-default bg-bg-surface-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded" className="block h-40 w-full object-contain" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-sm border border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {showError && <p className="text-caption text-status-critical">{showError}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-border-default bg-bg-surface text-text-secondary transition-colors',
          isDragActive && 'border-border-focus bg-bg-surface-raised text-text-primary',
          isDragReject && 'border-status-critical',
          isUploading && 'pointer-events-none opacity-60',
        )}
        aria-label={label}
      >
        <input {...getInputProps()} />
        <ImagePlus className="h-6 w-6" />
        <div className="text-center text-caption">
          {isUploading ? (
            <span>Uploading…</span>
          ) : isDragActive ? (
            <span>Drop the photo here…</span>
          ) : (
            <>
              <p className="font-medium text-text-primary">{label}</p>
              <p className="mt-0.5">Drag & drop or click to browse</p>
              <p className="mt-0.5 text-text-muted">JPEG, PNG, or WebP · max 5MB</p>
            </>
          )}
        </div>
      </div>
      {showError && <p className="text-caption text-status-critical">{showError}</p>}
    </div>
  );
}
