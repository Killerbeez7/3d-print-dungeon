import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faFile, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useCallback } from "react";
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
          className={`group relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl p-10 mb-6 cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-section
                        ${
                          isDragActive
                            ? "border-accent bg-accent-soft shadow-lg shadow-accent/10"
                            : "border-br-secondary/60 bg-surface-card hover:border-accent hover:bg-accent-soft/40 hover:shadow-md"
                        }
                    `}
        >
          <input {...getInputProps()} />
          <FontAwesomeIcon
            icon={faCloudArrowUp}
            className="text-5xl text-accent transition-all duration-200 group-hover:scale-105 group-hover:text-accent-hover"
          />
          <h2 className="text-lg text-center text-txt-primary transition-colors group-hover:text-accent">
            Drag & Drop your files
          </h2>
          <p className="text-center text-sm text-txt-secondary transition-colors group-hover:text-accent-text">
            or click to browse
          </p>

          <p className="max-w-lg text-center text-xs text-txt-muted">
            Supported: {ALLOWED_EXTENSIONS.join(", ")}
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

const UploadedFilesList: FC<UploadedFilesListProps> = ({ files, removeFile }) => {
  return (
    <div className="border-2 border-br-secondary rounded-md p-4 mt-4 bg-surface-card">
      <ul className="flex flex-col gap-2">
        {files.map((file) => (
          <li
            key={file.name}
            className="flex items-center justify-between  hover:bg-muted p-3 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFile} className="text-accent" />
              <span className="text-txt-primary truncate max-w-[200px]">{file.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-txt-primary">{(file.size / 1024).toFixed(2)} KB</span>
              {removeFile && (
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-txt-secondary hover:text-error"
                >
                  <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
