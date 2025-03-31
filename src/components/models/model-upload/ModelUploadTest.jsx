// Separate sections for first step, second step, and buttons

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// Main Upload Flow Component
export const ModelUploadTest = () => {
    const [files, setFiles] = useState([]);
    const [step, setStep] = useState(1); // Track the step (1: Upload, 2: Information)

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
        <div className="container mx-auto p-4 space-y-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={step} />

            <section className="bg-bg-secondary rounded-md p-4">
                {/* File Upload Section (Step 1) */}
                {step === 1 && (
                    <FileUploadSection
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                        files={files}
                        removeFile={removeFile}
                        onNextStep={() => setStep(2)} // Move to the next step
                    />
                )}

                {/* Uploaded Files List */}
                {files.length > 0 && (
                    <UploadedFilesList files={files} removeFile={removeFile} />
                )}
            </section>

            {/* Model Information Section (Step 2) */}
            {step === 2 && <ModelInformationStep onPreviousStep={() => setStep(1)} />}
            
            {/* Buttons Section */}
            <ButtonsSection
                step={step}
                files={files}
                onNextStep={() => setStep(2)}
                onPreviousStep={() => setStep(1)}
            />
        </div>
    );
};

// Step Indicator Component
const StepIndicator = ({ currentStep }) => {
    return (
        <div className="flex items-center w-full max-w-md mx-auto mb-6">
            <StepIndicatorItem step={1} label="Uploaded" currentStep={currentStep} />
            <div className="flex-1 mx-4 border-t border-dashed border-gray-300"></div>
            <StepIndicatorItem step={2} label="Model Information" currentStep={currentStep} />
        </div>
    );
};

const StepIndicatorItem = ({ step, label, currentStep }) => {
    const isActive = currentStep === step;
    return (
        <div className={`flex items-center space-x-2 ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
            <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'} text-white font-bold`}>
                {step}
            </div>
            <span className="font-semibold">{label}</span>
        </div>
    );
};

// File Upload Section Component
const FileUploadSection = ({ getRootProps, getInputProps, isDragActive, files, removeFile, onNextStep }) => {
    return (
        <div>
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
                        New Folder
                    </button>
                </div>
            </div>
        </div>
    );
};

// Uploaded Files List Component
const UploadedFilesList = ({ files, removeFile }) => {
    return (
        <div>
            <h2 className="font-semibold text-lg pb-2">Uploaded Files:</h2>
            <ul>
                {files.map((file) => (
                    <li key={file.name} className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
                        <div className="flex items-center space-x-2">
                            <FileIcon />
                            <span className="text-gray-800">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{(file.size / 1024).toFixed(2)} KB</span>
                            <button
                                onClick={() => removeFile(file.name)}
                                className="text-red-500 hover:text-red-600"
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Buttons Section Component (newly added)
const ButtonsSection = ({ step, files, onNextStep, onPreviousStep }) => {
    return (
        <section className="bg-bg-secondary rounded-md p-4">
            {step === 1 && (
                <NextStepButton
                    files={files}
                    onNextStep={onNextStep}
                />
            )}
            {step === 2 && (
                <div className="flex justify-center gap-4">
                    <PreviousStepButton onPreviousStep={onPreviousStep} />
                    <SubmitButton />
                </div>
            )}
        </section>
    );
};

// Next Step Button Component
const NextStepButton = ({ files, onNextStep }) => {
    return (
        <div className="flex justify-center items-end">
            <button
                onClick={onNextStep}
                disabled={files.length === 0} // Disable when no files are uploaded
                className={`${files.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
                    } px-4 py-2 rounded-md`}
            >
                Next Step
            </button>
        </div>
    );
};

// Previous Step Button Component
const PreviousStepButton = ({ onPreviousStep }) => {
    return (
        <button
            onClick={onPreviousStep}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
            Previous Step
        </button>
    );
};

// Submit Button Component
const SubmitButton = () => {
    return (
        <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
            Submit
        </button>
    );
};

// File Icon Component (for the uploaded file)
const FileIcon = () => (
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
);

// Delete Icon Component (for the remove button)
const DeleteIcon = () => (
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
);

// Model Information Step Component
const ModelInformationStep = ({ onPreviousStep }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Enter Model Information</h2>
            <form className="space-y-4">
                <div>
                    <label htmlFor="modelName" className="block text-gray-700 font-semibold">Model Name</label>
                    <input
                        type="text"
                        id="modelName"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter model name"
                    />
                </div>

                <div>
                    <label htmlFor="modelDescription" className="block text-gray-700 font-semibold">Description</label>
                    <textarea
                        id="modelDescription"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter model description"
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-gray-700 font-semibold">Category</label>
                    <input
                        type="text"
                        id="category"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter category (optional)"
                    />
                </div>
            </form>
        </div>
    );
};
