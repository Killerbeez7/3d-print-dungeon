import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
// import { MdDelete } from "react-icons/md";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export function FilesUpload({ step, files, setFiles }) {
    const removeFile = (fileName) => {
        setFiles((prev) => prev.filter((file) => file.name !== fileName));
    };

    const allowedExtensions = [
        ".3ds",
        ".amt",
        ".blend",
        ".dwg",
        ".dxf",
        ".fbx",
        ".factory",
        ".fsd",
        ".iges",
        ".obj",
        ".ply",
        ".pro",
        ".rsdoc",
        ".scad",
        ".shape",
        ".shapr",
        ".skp",
        ".sldasm",
        ".sldprt",
        ".slc",
        ".step",
        ".stl",
        ".stp",
        ".studio3",
        ".svg",
        ".tcw",
        ".x_t",
        ".x_b",
    ];

    const onDrop = useCallback(
        (acceptedFiles) => {
            const validFiles = acceptedFiles.filter((file) => {
                const lower = file.name.toLowerCase();
                return allowedExtensions.some((ext) => lower.endsWith(ext));
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
        // Don't pass accept for unknown MIME types
        // You can optionally pass `accept: '*/*'` if needed
    });

    return (
        <section>
            {/* show drag-and-drop only in step 1 */}
            {step === 1 && (
                <div
                    {...getRootProps()}
                    className={`border-2 mb-4 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-green-500 bg-green-50" : "border-br-secondary bg-bg-surface"}`}
                >
                    <input {...getInputProps()} />
                    <p className="font-semibold mb-2">Drag your files here</p>
                    <p className="text-txt-secondary text-sm mb-4">
                        Supported 3D formats: .3ds, .amt, .blend, .dwg, .dxf, .fbx,
                        .factory, .fsd, .iges, .obj, .ply, .pro, .rsdoc, .scad, .shape,
                        .shapr, .skp, .sldasm, .sldprt, .slc, .step, .stl, .stp, .studio3,
                        .svg, .tcw, .x_t, .x_b
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button className="cta-button px-4 py-2">
                            Browse
                        </button>
                        <button className="secondary-button px-4 py-2">
                            New Folder
                        </button>
                    </div>
                </div>
            )}

            {/* file list */}
            {files.length > 0 && (
                <UploadedFilesList
                    files={files}
                    removeFile={step === 1 ? removeFile : null}
                />
            )}
        </section>
    );
}

function UploadedFilesList({ files, removeFile }) {
    return (
        <div className="border-2 border-br-secondary rounded-md p-4 mt-4">
            <ul className="flex flex-col gap-2">
                {files.map((file) => (
                    <li
                        key={file.name}
                        className="flex items-center justify-between bg-bg-surface p-2 rounded-md px-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-txt-primary">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-txt-primary">
                                {(file.size / 1024).toFixed(2)} KB
                            </span>
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
}