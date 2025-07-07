import type { ModelViewerElement } from "@google/model-viewer";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
                src?: string;
                poster?: string;
                alt?: string;
                "camera-controls"?: boolean;
                "interaction-prompt"?: string;
                "environment-image"?: string;
                "auto-rotate"?: boolean;
                "camera-orbit"?: string;
                "min-camera-orbit"?: string;
                "max-camera-orbit"?: string;
                "min-field-of-view"?: string;
                "max-field-of-view"?: string;
                "field-of-view"?: string;
            };
        }
    }
}

export { };