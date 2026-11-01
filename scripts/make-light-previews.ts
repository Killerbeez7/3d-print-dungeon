// One-time job: give existing listings a light 3D preview (see
// src/features/models/utils/lightPreview.ts) and delete their full-detail
// viewer files, which anyone could convert back into a printable model.
//
// Run functions/scripts/protect-original-files.js first, then from the repo
// root, with a service account key (never commit it):
//
//   GOOGLE_APPLICATION_CREDENTIALS=src/keys/service_key.json npx tsx scripts/make-light-previews.ts
//
// That is a dry run: it only prints what it would do. Add --apply to do it.
// Safe to run again; listings that already have a preview are skipped.

import { randomUUID } from "node:crypto";
import process from "node:process";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage, getDownloadURL } from "firebase-admin/storage";

import { originalPathOf, pathFromDownloadUrl } from "../functions/src/shared/storagePaths.js";
import { fileToTriangles } from "../src/features/models/utils/converter";
import { makeLightPreview } from "../src/features/models/utils/lightPreview";

const apply = process.argv.includes("--apply");

initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT ?? "print-dungeon-3d",
    storageBucket: process.env.STORAGE_BUCKET ?? "print-dungeon-3d.firebasestorage.app",
});
const db = getFirestore();
const bucket = getStorage().bucket();

const MEDIA_FIELDS = ["convertedFileUrl", "renderPrimaryUrl", "posterUrl", "originalFileUrl"];

const main = async () => {
    console.log(apply ? "Applying changes." : "Dry run: nothing is changed. Add --apply to run it.");

    const models = (await db.collection("models").get()).docs;
    // Viewer link of every listing after this run, to know which old files
    // nothing uses any more.
    const viewerAfter = new Map(models.map((doc) => [doc.id, doc.data().convertedFileUrl as string | undefined]));
    const oldViewerPaths = new Set<string>();
    let made = 0;
    let cleared = 0;
    let skipped = 0;

    for (const doc of models) {
        const data = doc.data();
        if (data.previewVersion >= 1) continue;

        const label = `${doc.id} "${data.name ?? ""}"`;
        const originalPath = originalPathOf(data);
        const oldViewerPath = pathFromDownloadUrl(data.convertedFileUrl);
        if (!originalPath || !data.uploaderId) {
            console.log(`SKIP ${label}: no original file or uploader`);
            skipped += 1;
            continue;
        }

        const fileName: string = data.originalFileName ?? originalPath.split("/").pop();
        const [bytes] = await bucket.file(originalPath).download();
        const triangles = await fileToTriangles(new File([new Uint8Array(bytes)], fileName));

        if (!triangles) {
            // The 3D preview can't show this format; the "viewer file" was the
            // original itself. Images only from now on.
            console.log(`CLEAR ${label}: ${fileName} has no 3D preview; viewer link removed`);
            if (apply) {
                await doc.ref.update({ convertedFileUrl: "", previewVersion: 1 });
            }
            viewerAfter.set(doc.id, "");
            if (oldViewerPath) oldViewerPaths.add(oldViewerPath);
            cleared += 1;
            continue;
        }

        const preview = await makeLightPreview(triangles);
        const baseName = fileName.replace(/\.[^.]+$/, "");
        const previewPath = `models/converted/${data.uploaderId}/${randomUUID()}/${baseName}-preview.glb`;
        console.log(
            `PREVIEW ${label}: ${preview.sourceTriangles} -> ${preview.triangles} triangles, ` +
                `${(preview.glb.byteLength / 1048576).toFixed(1)} MB at ${previewPath}`
        );

        if (apply) {
            const target = bucket.file(previewPath);
            await target.save(Buffer.from(preview.glb), {
                contentType: "model/gltf-binary",
                metadata: { cacheControl: "public,max-age=31536000,immutable" },
            });
            const url = await getDownloadURL(target);
            await doc.ref.update({
                convertedFileUrl: url,
                previewTriangles: preview.triangles,
                sourceTriangles: preview.sourceTriangles,
                previewVersion: 1,
            });
            viewerAfter.set(doc.id, url);
        } else {
            viewerAfter.set(doc.id, `planned:${previewPath}`);
        }
        if (oldViewerPath) oldViewerPaths.add(oldViewerPath);
        made += 1;
    }

    // Delete the old full-detail viewer files that no listing uses any more.
    const stillUsed = new Set<string>();
    for (const doc of models) {
        const data: Record<string, unknown> = { ...doc.data(), convertedFileUrl: viewerAfter.get(doc.id) };
        for (const field of MEDIA_FIELDS) {
            const path = pathFromDownloadUrl(data[field]);
            if (path) stillUsed.add(path);
        }
        for (const url of (data.renderExtraUrls as string[] | undefined) ?? []) {
            const path = pathFromDownloadUrl(url);
            if (path) stillUsed.add(path);
        }
    }

    let deleted = 0;
    for (const path of oldViewerPaths) {
        if (stillUsed.has(path)) {
            console.log(`KEEP ${path}: still in use`);
            continue;
        }
        console.log(`DELETE ${path}`);
        if (apply) await bucket.file(path).delete({ ignoreNotFound: true });
        deleted += 1;
    }

    console.log(
        `\nPreviews ${apply ? "made" : "to make"}: ${made}. Viewer links removed: ${cleared}. ` +
            `Skipped: ${skipped}. Old viewer files ${apply ? "deleted" : "to delete"}: ${deleted}.`
    );
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
