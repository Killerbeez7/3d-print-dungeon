import { db, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

/**
 * createAdvancedModel:
 * 1) Uploads the original file
 * 2) If STL => convert -> glTF, then upload that
 * 3) Creates a Firestore doc in "models" with metadata
 * 4) Calls onProgress(...) to update 0 -> 100
 */
export async function createAdvancedModel({
    name,
    description,
    tags,
    file,
    userId,
    onProgress,
}) {
    if (!file) throw new Error("No file provided");

    // For progress updates in the UI
    const progressFn = onProgress || (() => {});
    let progress = 0;
    progressFn(progress);

    // Step 1: upload the original file
    const originalRef = ref(storage, `models/original/${file.name}`);
    const uploadTaskOriginal = uploadBytesResumable(originalRef, file);

    // 0 -> 50% for original
    const originalFileUrl = await new Promise((resolve, reject) => {
        uploadTaskOriginal.on(
            "state_changed",
            (snap) => {
                const ratio = snap.bytesTransferred / snap.totalBytes;
                progress = ratio * 50;
                progressFn(progress);
            },
            (err) => reject(err),
            async () => {
                const url = await getDownloadURL(
                    uploadTaskOriginal.snapshot.ref
                );
                resolve(url);
            }
        );
    });

    // Step 2: If STL => convert + upload glTF (50 -> 100%)
    let convertedFileUrl = null;
    if (file.name.toLowerCase().endsWith(".stl")) {
        // convert stl -> gltf
        const { blob } = await convertStlToGltf(file);

        // upload gltf
        const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
        const convertedRef = ref(
            storage,
            `models/converted/${fileNameNoExt}.gltf`
        );
        const uploadTaskConverted = uploadBytesResumable(convertedRef, blob);

        convertedFileUrl = await new Promise((resolve, reject) => {
            uploadTaskConverted.on(
                "state_changed",
                (snap) => {
                    const ratio = snap.bytesTransferred / snap.totalBytes;
                    const offset = 50 + ratio * 50; // 50 -> 100
                    progress = offset;
                    progressFn(progress);
                },
                (err) => reject(err),
                async () => {
                    const url = await getDownloadURL(
                        uploadTaskConverted.snapshot.ref
                    );
                    resolve(url);
                }
            );
        });
    }

    // Step 3: Create Firestore doc
    const docData = {
        name,
        description,
        tags,
        userId,
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
        createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "models"), docData);

    progressFn(100);

    return {
        originalFileUrl,
        convertedFileUrl: convertedFileUrl || originalFileUrl,
    };
}

/**
 * convertStlToGltf
 * Minimal scene with directional light, exporting glTF (JSON).
 */
async function convertStlToGltf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const arrayBuffer = reader.result;
                const loader = new STLLoader();
                const geometry = loader.parse(arrayBuffer);

                const material = new THREE.MeshStandardMaterial({
                    color: 0xaaaaaa,
                });
                const mesh = new THREE.Mesh(geometry, material);

                geometry.computeBoundingBox();
                const cx =
                    (geometry.boundingBox.max.x + geometry.boundingBox.min.x) /
                    2;
                const cy =
                    (geometry.boundingBox.max.y + geometry.boundingBox.min.y) /
                    2;
                const cz =
                    (geometry.boundingBox.max.z + geometry.boundingBox.min.z) /
                    2;
                mesh.position.set(-cx, -cy, -cz);

                const scene = new THREE.Scene();
                scene.add(mesh);

                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(10, 10, 10);
                scene.add(light);

                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (gltf) => {
                        const gltfString = JSON.stringify(gltf);
                        const blob = new Blob([gltfString], {
                            type: "application/json",
                        });
                        resolve({ blob });
                    },
                    (err) => reject(err)
                );
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}
