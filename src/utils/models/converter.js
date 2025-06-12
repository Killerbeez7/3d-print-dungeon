// Dynamic imports for Three.js and its loaders (better for code splitting)
const loadThree = async () => {
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
        console.error("Error details:", error.message, error.stack);
        throw new Error(
            "Failed to load 3D conversion libraries. This may be due to a network issue or browser compatibility. Please try refreshing the page and uploading again."
        );
    }
};

export async function finalConvertFileToGLB(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const arrayBuffer = reader.result;
                const lowerExt = file.name.toLowerCase();

                const { THREE, STLLoader, OBJLoader, GLTFExporter } = await loadThree();

                let scene = new THREE.Scene();
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
                    scene.add(obj);
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
                    (binaryResult) => {
                        const blob = new Blob([binaryResult], {
                            type: "model/gltf-binary",
                        });
                        resolve({ blob });
                    },
                    (err) => reject(err),
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

/**
 * Helper: centerMesh(geometry)
 */
function centerMesh(geometry, THREE) {
    const material = new THREE.MeshStandardMaterial({ color: 0xe4e4e4 });
    const mesh = new THREE.Mesh(geometry, material);
    geometry.computeBoundingBox();

    const centerX = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    const centerY = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    const centerZ = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.position.set(-centerX, -centerY, -centerZ);
    return mesh;
}
