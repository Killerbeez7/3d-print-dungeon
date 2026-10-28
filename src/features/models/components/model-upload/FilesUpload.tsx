import { useCallback } from "react";
import { FileBox, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { ALLOWED_EXTENSIONS } from "../../constants/ALLOWED_EXTENSIONS";
import type { FC, Dispatch, SetStateAction } from "react";

export interface FilesUploadProps {
  step: number;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

export const FilesUpload: FC<FilesUploadProps> = ({ step, files, setFiles }) => {
  const removeFile = (fileName: string): void => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        const lower = file.name.toLowerCase();
        return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      });

      if (validFiles.length !== acceptedFiles.length) {
        alert("Some files were skipped due to unsupported file formats.");
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <section>
      {/* show drag-and-drop only in step 1 */}
      {step === 1 && (
        <div
          {...getRootProps()}
          className={`bg-buildplate group relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed px-6 py-14 text-center outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-focus ${
            isDragActive
              ? "border-accent bg-accent-soft"
              : "border-br-input bg-page hover:border-accent"
          }`}
        >
          <input {...getInputProps()} />
          {/* Nozzle line sweeps while files hover over the plate */}
          {isDragActive && <span className="skeleton-print absolute inset-0 opacity-60" aria-hidden="true" />}
          <span className="chamfer relative flex size-14 items-center justify-center bg-btn-primary text-btn-primary-text [--cut:10px] transition-transform duration-300 group-hover:-translate-y-1">
            <Upload className="size-6" aria-hidden="true" />
          </span>
          <p className="relative font-display text-lg font-semibold text-txt-primary">
            {isDragActive ? "Drop to add your files" : "Drop your model files here"}
          </p>
          <p className="relative text-sm text-txt-secondary">
            or <span className="font-semibold text-accent underline-offset-2 group-hover:underline">browse</span>{" "}
            from your device
          </p>
          <p className="relative mt-2 max-w-xl font-mono text-[0.7rem] leading-relaxed text-txt-muted">
            {ALLOWED_EXTENSIONS.join("  ")}
          </p>
        </div>
      )}

      {/* file list */}
      {files.length > 0 && (
        <UploadedFilesList
          files={files}
          removeFile={step === 1 ? removeFile : undefined}
        />
      )}
    </section>
  );
};

interface UploadedFilesListProps {
  files: File[];
  removeFile?: (fileName: string) => void;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const UploadedFilesList: FC<UploadedFilesListProps> = ({ files, removeFile }) => {
  return (
    <ul className="mt-4 divide-y divide-br-subtle rounded-lg border border-br-subtle bg-surface-card">
      {files.map((file) => (
        <li key={file.name} className="flex items-center gap-3 px-4 py-3">
          <span className="chamfer flex size-9 shrink-0 items-center justify-center bg-accent-soft text-accent [--cut:7px]">
            <FileBox className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-txt-primary">{file.name}</span>
            <span className="font-mono text-xs text-txt-muted">
              {file.name.split(".").pop()?.toUpperCase()} · {formatSize(file.size)}
            </span>
          </span>
          {removeFile && (
            <button
              type="button"
              onClick={() => removeFile(file.name)}
              aria-label={`Remove ${file.name}`}
              className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-error/10 hover:text-error"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};
