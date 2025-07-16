// Dynamic imports for Three.js and its loaders (better for code splitting)
export const loadThree = async (): Promise<{
    THREE: typeof import("three");
    STLLoader: typeof import("three/examples/jsm/loaders/STLLoader").STLLoader;
    OBJLoader: typeof import("three/examples/jsm/loaders/OBJLoader").OBJLoader;
    GLTFExporter: typeof import("three/examples/jsm/exporters/GLTFExporter").GLTFExporter;
}> => {
    try {

        console.log("Loading Three.js modules...");
        const [three, stlLoader, objLoader, gltfExporter] = await Promise.all([
            import("three"),
            import("three/examples/jsm/loaders/STLLoader"),
            import("three/examples/jsm/loaders/OBJLoader"),
            import("three/examples/jsm/exporters/GLTFExporter"),
        ]);

        console.log("Three.js modules loaded successfully");
        return {
            THREE: three,
            STLLoader: stlLoader.STLLoader,
            OBJLoader: objLoader.OBJLoader,
            GLTFExporter: gltfExporter.GLTFExporter,
        };
    } catch (error) {

        console.error("Failed to load Three.js modules:", error);
        if (error instanceof Error) {

            console.error("Error details:", error.message, error.stack);
        }
        throw new Error(
            "Failed to load 3D conversion libraries. This may be due to a network issue or browser compatibility. Please try refreshing the page and uploading again."
        );
    }
};


export async function finalConvertFileToGLB(file: File): Promise<{ blob: Blob }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const arrayBuffer = reader.result;
                if (!(arrayBuffer instanceof ArrayBuffer)) {
                    reject(new Error("File could not be read as ArrayBuffer"));
                    return;
                }
                const lowerExt = file.name.toLowerCase();
                const { THREE, STLLoader, OBJLoader, GLTFExporter } = await loadThree();
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x616161);
                if (lowerExt.endsWith(".stl")) {
                    const stlLoader = new STLLoader();
                    const geometry = stlLoader.parse(arrayBuffer);
                    const mesh = centerMesh(geometry, THREE);
                    scene.add(mesh);
                } else if (lowerExt.endsWith(".obj")) {
                    const objText = new TextDecoder().decode(arrayBuffer);
                    const objLoader = new OBJLoader();
                    const obj = objLoader.parse(objText);
                    if (obj && typeof obj === "object" && "type" in obj) {
                        scene.add(obj as import("three").Object3D);
                    } else {
                        reject(new Error("OBJLoader did not return a valid Object3D"));
                        return;
                    }
                } else {
                    reject(new Error("Unsupported file type for final .glb conversion"));
                    return;
                }
                // Some basic lighting
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(10, 10, 10);
                scene.add(directionalLight);
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);
                // Export .glb
                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (result: object | ArrayBuffer) => {
                        if (result instanceof ArrayBuffer) {
                            const blob = new Blob([result], { type: "model/gltf-binary" });
                            resolve({ blob });
                        } else {
                            reject(new Error("GLTFExporter did not return a binary ArrayBuffer"));
                        }
                    },
                    (err: unknown) => reject(err),
                    { binary: true }
                );
            } catch (err) {
                console.error("Conversion error:", err);
                reject(err);
            }
        };
        reader.onerror = (err) => {
            console.error("File reading error:", err);
            reject(err);
        };
        reader.readAsArrayBuffer(file);
    });
}


function centerMesh(
    geometry: import("three").BufferGeometry,
    THREE: typeof import("three")
): import("three").Mesh {
    geometry.computeBoundingBox();
    // Ensure boundingBox is not null
    if (!geometry.boundingBox) {
        throw new Error("Bounding box could not be computed.");
    }
    const { max, min } = geometry.boundingBox;
    const centerX = (max.x + min.x) / 2;
    const centerY = (max.y + min.y) / 2;
    const centerZ = (max.z + min.z) / 2;

    const material = new THREE.MeshStandardMaterial({ color: 0xe4e4e4 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-centerX, -centerY, -centerZ);
    return mesh;
}
