// Gives the accounts below the super admin and admin claims. A super admin can
// make other people admins, so only list accounts the owner controls.
//
// Runs on GitHub with the stored key: set .github/data-maintenance.json to
//   { "script": "set-super-admins", "apply": false }
// and push (apply: false only prints each account's current claims). By hand,
// from the repo root with a key file (never commit it):
//   GOOGLE_APPLICATION_CREDENTIALS=src/keys/service_key.json node src/scripts/setSuperAdmin.cjs --apply
//
// Existing claims are kept. Claims take effect at the user's next sign-in.

const admin = require("firebase-admin");

const apply = process.argv.includes("--apply");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCLOUD_PROJECT || "print-dungeon-3d",
});

const users = [
  { uid: "IVzzXjLMI3bF47tH8lZrPCDHtlz1", note: "plamen main" },
  { uid: "lKrp06oT0zLtEspBiSTukXbxtr33", note: "jaram" },
];

async function main() {
  console.log(apply ? "Applying changes." : "Dry run: nothing is changed. Add --apply to run it.");
  let failed = 0;

  for (const { uid, note } of users) {
    try {
      const user = await admin.auth().getUser(uid);
      const current = user.customClaims || {};
      if (current.super === true && current.admin === true) {
        console.log(`OK ${note} (${uid}): already super admin`, current);
        continue;
      }
      if (!apply) {
        console.log(`WOULD SET ${note} (${uid}): current claims`, current);
        continue;
      }
      await admin.auth().setCustomUserClaims(uid, { ...current, super: true, admin: true });
      const updated = await admin.auth().getUser(uid);
      console.log(`SET ${note} (${uid}):`, updated.customClaims);
    } catch (error) {
      failed += 1;
      console.error(`FAILED ${note} (${uid}):`, error.message);
    }
  }

  process.exit(failed ? 1 : 0);
}

main();
