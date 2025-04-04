import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

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

                let scene = new THREE.Scene();
                // scene.background = new THREE.Color(0x222222);  /old
                scene.background = new THREE.Color(0x616161);

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
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Helper: centerMesh(geometry)
 */
function centerMesh(geometry) {
    // const material = new THREE.MeshStandardMaterial({ color: 0xcccccc }); //old
    const material = new THREE.MeshStandardMaterial({ color: 0xE4E4E4 }); 
    const mesh = new THREE.Mesh(geometry, material);
    geometry.computeBoundingBox();

    const centerX = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    const centerY = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    const centerZ = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.position.set(-centerX, -centerY, -centerZ);
    return mesh;
}
