import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MdDelete } from "react-icons/md";
import { useModelUpload } from "../../../contexts/modelUploadContext";

export const FileUploadStep = () => {
    const { step, files, setFiles } = useModelUpload();

    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, [setFiles]);

    const removeFile = (fileName) => {
        setFiles((prev) => prev.filter((file) => file.name !== fileName));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <section>
            {/* Show drag-and-drop only in step 1 */}
            {step === 1 && (
                <div
                    {...getRootProps()}
                    className={`border-2 mb-4 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"}`}
                >
                    <input {...getInputProps()} />
                    <p className="font-semibold mb-2">Drag your files here</p>
                    <p className="text-gray-500 text-sm mb-4">
                        Supported 3D formats: .3ds, .amt, .blend, .dwg, .dxf, .fbx, .factory,
                        .fsd, .iges, .obj, .ply, .pro, .rsdoc, .scad, .shape, .shapr, .skp,
                        .sldasm, .sldprt, .slc, .step, .stl, .stp, .studio3, .svg, .tcw, .x_t,
                        .x_b
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                            Browse
                        </button>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                            New Folder
                        </button>
                    </div>
                </div>
            )}

            {/* File list (always visible) */}
            {files.length > 0 && (
                <UploadedFilesList files={files} removeFile={step === 1 ? removeFile : null} />
            )}
        </section>
    );
};

export const UploadedFilesList = ({ files, removeFile }) => (
    <div className="border-2 border-br-secondary rounded-md p-4 mt-4">
        <ul className="flex flex-col gap-2">
            {files.map((file) => (
                <li key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded-md px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-800">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">{(file.size / 1024).toFixed(2)} KB</span>
                        {removeFile && (
                            <button
                                onClick={() => removeFile(file.name)}
                                className="text-red-500 hover:text-red-600"
                            >
                                <MdDelete size={24} />
                            </button>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    </div>
);
