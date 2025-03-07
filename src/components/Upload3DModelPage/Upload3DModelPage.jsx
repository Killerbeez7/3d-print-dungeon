import { useState } from "react";

export const Upload3DModelPage = () => {
    const [modelName, setModelName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you’d typically handle upload logic, e.g. send to server
        console.log("Uploading:", {
            modelName,
            description,
            tags,
            file,
        });
        alert("Model submitted (check console)!");
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-txPrimary mb-6">
                Upload 3D Printable Model
            </h1>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl bg-bgDarker rounded-lg shadow-xl p-6 space-y-6"
            >
                {/* Model Name */}
                <div>
                    <label className="block text-txPrimary font-medium mb-1">
                        Model Name
                    </label>
                    <input
                        type="text"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="
              w-full px-3 py-2 
              border border-gray-300 rounded 
              focus:outline-none 
              focus:ring focus:ring-primary
            "
                        placeholder="E.g. Medieval Castle Tower"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-txPrimary font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="
              w-full px-3 py-2 
              border border-gray-300 rounded 
              focus:outline-none 
              focus:ring focus:ring-primary
            "
                        rows="3"
                        placeholder="Describe your model (dimensions, usage, instructions, etc.)"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-txPrimary font-medium mb-1">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="
              w-full px-3 py-2
              border border-gray-300 rounded
              focus:outline-none 
              focus:ring focus:ring-primary
            "
                        placeholder="architecture, medieval, tower, etc."
                    />
                </div>

                {/* Drag & Drop area or file upload */}
                <div
                    className="
            border-2 border-dashed border-gray-300 
            rounded-lg p-6 text-center 
            hover:bg-gray-50 
            transition-colors
          "
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {file ? (
                        <div className="text-gray-700">
                            <i className="fas fa-check-circle text-green-500 mr-1"></i>
                            {file.name}
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-2">
                                Drag & drop your .STL or .OBJ file here
                            </p>
                            <p className="text-gray-400 text-sm">
                                or click below to browse
                            </p>
                            <div className="mt-4">
                                <label
                                    htmlFor="fileInput"
                                    className="
                    bg-primary text-white 
                    py-2 px-4 rounded 
                    hover:bg-hvPrimary 
                    cursor-pointer
                  "
                                >
                                    Choose a file
                                </label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept=".stl,.obj,.zip"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Submit / Publish */}
                <button
                    type="submit"
                    className="
            w-full bg-primary text-white
            py-2 rounded 
            hover:bg-hvPrimary 
            transition-colors
          "
                >
                    Publish Model
                </button>
            </form>
        </div>
    );
};
