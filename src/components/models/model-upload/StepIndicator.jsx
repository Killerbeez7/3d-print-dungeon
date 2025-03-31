import React from "react";

const StepIndicator = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
            {/* Steps */}
            <div className="flex items-center w-full">
                {/* Step 1: Uploaded */}
                <div className="flex items-center space-x-2">
                    {/* Green circle with check icon */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <span className="text-green-600 font-semibold">Uploaded</span>
                </div>

                {/* Separator line */}
                <div className="flex-1 mx-4 border-t border-gray-300"></div>

                {/* Step 2: Model Information */}
                <div className="flex items-center space-x-2">
                    {/* Gray circle with step number */}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-gray-600">
                        2
                    </div>
                    <span className="text-gray-600 font-semibold">Model Information</span>
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
