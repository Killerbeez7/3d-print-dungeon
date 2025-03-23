import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useModels } from "../../../contexts/modelsContext";
import { getAuth } from "firebase/auth";

export const ModelView = () => {
  const { id } = useParams();
  const { models, loading } = useModels();
  const auth = getAuth();
  const user = auth.currentUser;

  // -1 means the main preview shows the 3D model
  // 0..N means the main preview shows renderFileUrls[index]
  const [selectedRenderIndex, setSelectedRenderIndex] = useState(-1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
        Loading model...
      </div>
    );
  }

  const model = models.find((m) => m.id === id);
  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
        Model not found!
      </div>
    );
  }

  // Renders array (images) from Firestore
  const renderFileUrls = model.renderFileUrls || [];

  // MAIN PREVIEW:
  // If selectedRenderIndex === -1 => show 3D model
  // Otherwise => show that render image
  const mainPreview =
    selectedRenderIndex === -1 ? (
      model.convertedFileUrl ? (
        <model-viewer
          src={model.convertedFileUrl}
          alt="3D Model"
          camera-controls
          auto-rotate
          crossOrigin="anonymous"
          environment-image="neutral"
          className="rounded-md shadow-lg"
          style={{ width: "100%", height: "400px" }}
        ></model-viewer>
      ) : (
        <div className="flex items-center justify-center w-full h-[400px] bg-gray-200 rounded-md">
          No 3D preview available
        </div>
      )
    ) : (
      <img
        src={renderFileUrls[selectedRenderIndex]}
        alt={`Render ${selectedRenderIndex + 1}`}
        className="w-full h-[400px] object-contain rounded-md shadow-lg"
      />
    );

  // THUMBNAILS:
  // The first thumbnail is a *small* <model-viewer> for the 3D model
  // The rest are images from renderFileUrls
  return (
    <div className="bg-bg-primary text-txt-primary min-h-screen p-6 flex flex-col lg:flex-row gap-8">
      {/* Left: Main Preview + Thumbnails */}
      <div className="flex-1">
        <div className="relative">{mainPreview}</div>

        {/* Thumbnail row */}
        <div className="mt-4 flex space-x-4 overflow-x-auto pb-2">
          {/* 3D model thumbnail */}
          <div
            onClick={() => setSelectedRenderIndex(-1)}
            className={`flex-shrink-0 w-20 h-20 border-4 rounded-md cursor-pointer overflow-hidden ${
              selectedRenderIndex === -1
                ? "border-fuchsia-600"
                : "border-transparent hover:fuchsia-600"
            }`}
          >
            {model.convertedFileUrl ? (
              <model-viewer
                src={model.convertedFileUrl}
                alt="3D thumb"
                camera-controls
                auto-rotate
                style={{ width: "100%", height: "100%" }}
                // For a small thumbnail, we might disable environment for speed
                environment-image="neutral"
                className="object-cover"
              ></model-viewer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">
                3D
              </div>
            )}
          </div>

          {/* Render image thumbnails */}
          {renderFileUrls.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedRenderIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 border-4 rounded-md cursor-pointer overflow-hidden ${
                selectedRenderIndex === idx
                  ? "border-fuchsia-600"
                  : "border-transparent hover:fuchsia-600"
              }`}
            >
              <img
                src={url}
                alt={`Render ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Sidebar with details and buttons */}
      <aside className="w-full lg:w-[360px] bg-bg-surface p-6 rounded-md shadow-lg space-y-6">
        {/* If user is logged in, show user info */}
        {user && (
          <div className="flex items-center space-x-4 border-b pb-4">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt={user.displayName || "Anonymous"}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">
                {user.displayName || "Anonymous"}
              </h2>
            </div>
          </div>
        )}

        {/* Model Info */}
        <div>
          <h1 className="text-2xl font-bold">{model.name}</h1>
          <p className="mt-2 text-gray-600">{model.description}</p>
        </div>

        {/* Likes / Views */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <i className="fas fa-heart text-red-500"></i>
            <span>{model.likes || 0} Likes</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fas fa-eye text-blue-500"></i>
            <span>{model.views || 0} Views</span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {(model.tags || []).map((tag, index) => (
              <span key={index} className="bg-gray-200 px-3 py-1 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-btn-secondary text-txt-primary font-medium py-2 rounded-lg hover:bg-btn-secondary-hover">
            Like
          </button>
          <button className="bg-btn-secondary text-txt-primary font-medium py-2 rounded-lg hover:bg-btn-secondary-hover">
            Save
          </button>
          {model.originalFileUrl && (
            <button
              onClick={() => window.open(model.originalFileUrl, "_blank")}
              className="bg-btn-primary text-white font-medium py-2 rounded-lg hover:bg-btn-primary-hover"
            >
              Download Original
            </button>
          )}
          {model.convertedFileUrl &&
            model.convertedFileUrl !== model.originalFileUrl && (
              <button
                onClick={() => window.open(model.convertedFileUrl, "_blank")}
                className="bg-btn-primary text-white font-medium py-2 rounded-lg hover:bg-btn-primary-hover"
              >
                Download Converted (glTF)
              </button>
            )}
        </div>

        {/* Edit button for owner */}
        {user && user.uid === model.userId && (
          <Link
            to={`/model/${model.id}/edit`}
            className="block text-center bg-btn-secondary text-white py-2 px-4 rounded hover:bg-btn-secondary-hover transition-colors"
          >
            Edit Model
          </Link>
        )}
      </aside>
    </div>
  );
};
