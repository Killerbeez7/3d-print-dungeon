import '@google/model-viewer';

interface ModelViewerElement extends HTMLElement {
    src: string;
    poster?: string;
    cameraControls?: boolean;
    environmentImage?: string;
    /** Resolves when the model is fully rendered */
    updateComplete?: Promise<void>;
    pause: () => void;
    toDataURL: (type?: string) => string;
    addEventListener: HTMLElement["addEventListener"];
    removeEventListener: HTMLElement["removeEventListener"];
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<ModelViewerElement>, ModelViewerElement>;
        }
    }
}

export { };
