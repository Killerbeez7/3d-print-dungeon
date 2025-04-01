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

                // Create a new scene and set a light gray background.
                let scene = new THREE.Scene();
                scene.background = new THREE.Color(0x222222);

                // Load the file and add its object to the scene.
                if (lowerExt.endsWith(".stl")) {
                    const stlLoader = new STLLoader();
                    const geometry = stlLoader.parse(arrayBuffer);
                    const mesh = centerMesh(geometry);
                    scene.add(mesh);
                } else if (lowerExt.endsWith(".obj")) {
                    const objText = new TextDecoder().decode(arrayBuffer);
                    const objLoader = new OBJLoader();
                    const obj = objLoader.parse(objText);
                    scene.add(obj);
                } else {
                    reject(new Error("Unsupported file type for local preview"));
                    return;
                }

                // Add a directional light.
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(10, 10, 10);
                scene.add(directionalLight);

                // Add an ambient light for softer illumination.
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);

                // Add a grid helper to give context of scale.
                // const gridHelper = new THREE.GridHelper(200, 20);
                // scene.add(gridHelper);

                // Export the scene as a binary .glb.
                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (result) => {
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

                // Create a new scene and set a light gray background.
                let scene = new THREE.Scene();
                scene.background = new THREE.Color(0x222222);

                // Load the file and add its object to the scene.
                if (lowerExt.endsWith(".stl")) {
                    const stlLoader = new STLLoader();
                    const geometry = stlLoader.parse(arrayBuffer);
                    const mesh = centerMesh(geometry);
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

                // Add a directional light.
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(10, 10, 10);
                scene.add(directionalLight);

                // Add an ambient light for softer illumination.
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                scene.add(ambientLight);

                // Add a grid helper to give context of scale.
                // const gridHelper = new THREE.GridHelper(200, 20);
                // scene.add(gridHelper);

                // Export the scene as a binary .glb.
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
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Helper: create a Mesh from geometry, center it, and return the mesh.
 */
function centerMesh(geometry) {
    const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const mesh = new THREE.Mesh(geometry, material);

    geometry.computeBoundingBox();
    const centerX = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    const centerY = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    const centerZ = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
    mesh.position.set(-centerX, -centerY, -centerZ);

    return mesh;
}
