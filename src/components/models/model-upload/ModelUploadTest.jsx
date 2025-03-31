import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export const ModelUploadTest = () => {
    const [files, setFiles] = useState([]);

    // Handler for when files are dropped or selected
    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    // Remove file by name
    const removeFile = (fileName) => {
        setFiles((prev) => prev.filter((file) => file.name !== fileName));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Step indicator */}
            <div className="flex items-center w-full max-w-md mx-auto mb-6">
                {/* Step 1: Uploaded */}
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white font-bold">
                        1
                    </div>
                    <span className="text-green-600 font-semibold">Uploaded</span>
                </div>
                {/* Separator */}
                <div className="flex-1 mx-4 border-t border-dashed border-gray-300"></div>
                {/* Step 2: Model Information */}
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-gray-600 font-bold">
                        2
                    </div>
                    <span className="text-gray-600 font-semibold">Model Information</span>
                </div>
            </div>

            {/* Drag-and-drop zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
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
                        New folder
                    </button>
                </div>
            </div>

            <div className="mt-4 text-center text-gray-600">
                Drag uploaded files here to add them into the root
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="mt-4">
                    {files.map((file) => (
                        <div
                            key={file.name}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2"
                        >
                            <div className="flex items-center space-x-2">
                                {/* Simple file icon (you can use a custom icon per extension if you like) */}
                                <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 16V4c0-1.1046.8954-2 2-2h10l6 6v8c0 1.1046-.8954 2-2 2H6c-1.1046 0-2-.8954-2-2z"
                                    />
                                </svg>
                                <span className="text-gray-800">{file.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Convert bytes to KB for display */}
                                <span className="text-gray-600">
                                    {(file.size / 1024).toFixed(2)} KB
                                </span>
                                <button
                                    onClick={() => removeFile(file.name)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
