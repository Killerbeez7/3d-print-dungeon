import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

/**
 * localConvertToGLBForPreview(file)
 * - Accepts an STL or OBJ file
 * - Returns { blob, blobUrl } for local preview in <model-viewer>
 * - Uses binary mode => .glb
 */
export async function localConvertToGLBForPreview(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const arrayBuffer = event.target.result;
                const lowerExt = file.name.toLowerCase();

                // Build a scene with the geometry
                let scene;
                if (lowerExt.endsWith(".stl")) {
                    const stlLoader = new STLLoader();
                    const geometry = stlLoader.parse(arrayBuffer);
                    const mesh = centerMesh(geometry);
                    scene = new THREE.Scene();
                    scene.add(mesh);
                } else if (lowerExt.endsWith(".obj")) {
                    const objText = new TextDecoder().decode(arrayBuffer);
                    const objLoader = new OBJLoader();
                    const obj = objLoader.parse(objText);
                    scene = new THREE.Scene();
                    scene.add(obj);
                } else {
                    reject(
                        new Error("Unsupported file type for local preview")
                    );
                    return;
                }

                // minimal light
                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(10, 10, 10);
                scene.add(light);

                // Export as .glb (binary)
                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (result) => {
                        // result is an ArrayBuffer in binary mode
                        const blob = new Blob([result], {
                            type: "model/gltf-binary",
                        });
                        const blobUrl = URL.createObjectURL(blob);
                        resolve({ blob, blobUrl });
                    },
                    (error) => reject(error),
                    { binary: true }
                );
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * finalConvertFileToGLB(file)
 * - Accepts .stl or .obj
 * - Returns { blob } for final .glb (binary)
 */
export async function finalConvertFileToGLB(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const arrayBuffer = reader.result;
                const lowerExt = file.name.toLowerCase();

                let scene;
                if (lowerExt.endsWith(".stl")) {
                    // parse STL
                    const stlLoader = new STLLoader();
                    const geometry = stlLoader.parse(arrayBuffer);
                    const mesh = centerMesh(geometry);
                    scene = new THREE.Scene();
                    scene.add(mesh);
                } else if (lowerExt.endsWith(".obj")) {
                    // parse OBJ
                    const objText = new TextDecoder().decode(arrayBuffer);
                    const objLoader = new OBJLoader();
                    const obj = objLoader.parse(objText);
                    scene = new THREE.Scene();
                    scene.add(obj);
                } else {
                    reject(
                        new Error(
                            "Unsupported file type for final .glb conversion"
                        )
                    );
                    return;
                }

                // minimal light
                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(10, 10, 10);
                scene.add(light);

                // Export as .glb (binary)
                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (binaryResult) => {
                        // binaryResult is an ArrayBuffer
                        const blob = new Blob([binaryResult], {
                            type: "model/gltf-binary",
                        });
                        resolve({ blob });
                    },
                    (err) => reject(err),
                    { binary: true } // important for .glb
                );
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Helper: create a Mesh from geometry, center it, return the mesh.
 */
function centerMesh(geometry) {
    const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const mesh = new THREE.Mesh(geometry, material);

    geometry.computeBoundingBox();
    const centerX =
        (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    const centerY =
        (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    const centerZ =
        (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
    mesh.position.set(-centerX, -centerY, -centerZ);

    return mesh;
}
