// One-time move of original model files from the public models/original folder
// to private/originals, where only getModelDownloadUrl can hand them out.
//
// Run from the functions/ folder with a service account key (never commit it):
//
//   GOOGLE_APPLICATION_CREDENTIALS=../src/keys/service_key.json node scripts/protect-original-files.js
//
// That is a dry run: it only prints what it would do. Add --apply to do it, and
// --delete-orphans to also delete files in models/original that no listing uses.
// Safe to run again; listings already moved are skipped.

import { randomUUID } from "node:crypto";
import process from "node:process";
import { pipeline } from "node:stream/promises";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import {
    LEGACY_ORIGINALS,
    PRIVATE_ORIGINALS,
    pathFromDownloadUrl,
} from "../src/shared/storagePaths.js";

const apply = process.argv.includes("--apply");
const deleteOrphans = process.argv.includes("--delete-orphans");

initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT ?? "print-dungeon-3d",
    storageBucket: process.env.STORAGE_BUCKET ?? "print-dungeon-3d.firebasestorage.app",
});
const db = getFirestore();
const bucket = getStorage().bucket();

const MEDIA_FIELDS = ["convertedFileUrl", "renderPrimaryUrl", "posterUrl"];

const main = async () => {
    console.log(apply ? "Applying changes." : "Dry run: nothing is changed. Add --apply to run it.");

    const models = (await db.collection("models").get()).docs;

    // Paths that public pages still load (a GLB original doubles as the viewer
    // file); those objects stay until light previews replace them.
    const publicMediaPaths = new Set();
    for (const doc of models) {
        const data = doc.data();
        for (const field of MEDIA_FIELDS) {
            const path = pathFromDownloadUrl(data[field]);
            if (path) publicMediaPaths.add(path);
        }
        for (const url of data.renderExtraUrls ?? []) {
            const path = pathFromDownloadUrl(url);
            if (path) publicMediaPaths.add(path);
        }
    }

    // Public originals that skipped listings still point at, and those moved.
    const legacyPathsInUse = new Set();
    const movedPaths = new Set();
    // Listings by one uploader that point at the same public file share one
    // private copy; deleteModel keeps a copy another listing still uses.
    const copyByLegacyPath = new Map();
    let moved = 0;
    let shared = 0;
    let skipped = 0;

    for (const doc of models) {
        const data = doc.data();
        if (!data.originalFileUrl) continue;

        const legacyPath = pathFromDownloadUrl(data.originalFileUrl);
        if (!legacyPath || !legacyPath.startsWith(`${LEGACY_ORIGINALS}/`)) {
            console.log(`SKIP ${doc.id}: original is not in ${LEGACY_ORIGINALS}/`);
            skipped += 1;
            continue;
        }
        if (!data.uploaderId) {
            console.log(`SKIP ${doc.id}: no uploaderId`);
            legacyPathsInUse.add(legacyPath);
            skipped += 1;
            continue;
        }

        const source = bucket.file(legacyPath);
        const [exists] = await source.exists();
        if (!exists) {
            console.log(`SKIP ${doc.id}: ${legacyPath} is missing`);
            legacyPathsInUse.add(legacyPath);
            skipped += 1;
            continue;
        }

        const fileName = legacyPath.split("/").pop();
        const copyKey = `${data.uploaderId}|${legacyPath}`;
        const existingCopy = copyByLegacyPath.get(copyKey);
        if (existingCopy) {
            console.log(`SHARE ${doc.id} "${data.name ?? ""}": same file as an earlier listing, ${existingCopy.path}`);
            if (apply) {
                await doc.ref.update({
                    originalFilePath: existingCopy.path,
                    originalFileName: fileName,
                    originalFileSize: existingCopy.size,
                    originalFileUrl: FieldValue.delete(),
                });
            }
            shared += 1;
            continue;
        }

        const privatePath = `${PRIVATE_ORIGINALS}/${data.uploaderId}/${randomUUID()}/${fileName}`;
        console.log(`MOVE ${doc.id} "${data.name ?? ""}": ${legacyPath} -> ${privatePath}`);

        let size = 0;
        if (apply) {
            // Stream into a new object instead of copying: a copy would keep the
            // old download token, and with it the old public link.
            const target = bucket.file(privatePath);
            const [sourceMetadata] = await source.getMetadata();
            await pipeline(
                source.createReadStream(),
                target.createWriteStream({
                    resumable: true,
                    metadata: { contentType: sourceMetadata.contentType },
                })
            );
            const [metadata] = await target.getMetadata();
            if (metadata.size !== sourceMetadata.size) {
                throw new Error(`Copy of ${legacyPath} is incomplete; nothing was changed for ${doc.id}.`);
            }
            size = Number(metadata.size);

            await doc.ref.update({
                originalFilePath: privatePath,
                originalFileName: fileName,
                originalFileSize: size,
                originalFileUrl: FieldValue.delete(),
            });
        }
        copyByLegacyPath.set(copyKey, { path: privatePath, size });
        movedPaths.add(legacyPath);
        moved += 1;
    }

    // Delete the public originals that no listing or page uses any more. This
    // also revokes their download links.
    const [legacyFiles] = await bucket.getFiles({ prefix: `${LEGACY_ORIGINALS}/` });
    let deleted = 0;
    let orphans = 0;
    for (const file of legacyFiles) {
        if (publicMediaPaths.has(file.name)) {
            console.log(`KEEP ${file.name}: also used as a viewer file or image`);
            continue;
        }
        if (legacyPathsInUse.has(file.name)) continue;

        if (!movedPaths.has(file.name)) {
            orphans += 1;
            if (!deleteOrphans) {
                console.log(`ORPHAN ${file.name}: no listing uses it (add --delete-orphans to delete)`);
                continue;
            }
        }
        console.log(`DELETE ${file.name}`);
        if (apply) await file.delete();
        deleted += 1;
    }

    console.log(
        `\nListings moved: ${moved}, sharing a moved file: ${shared}, skipped: ${skipped}. ` +
            `Public files ${apply ? "deleted" : "to delete"}: ${deleted}. Orphans found: ${orphans}.`
    );
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
