const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = JSON.parse(fs.readFileSync("../keys/service_key.json", "utf8"));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const { FieldValue } = admin.firestore;

const forumCategories = [
    {
        id: "general",
        name: "General Discussion",
        description: "General topics and discussions about 3D printing and modeling.",
        icon: "HiChatBubbleLeftRight",
        order: 1,
    },
    {
        id: "community",
        name: "Community",
        description: "Community events, meetups, and social discussions.",
        icon: "HiUsers",
        order: 2,
    },
    {
        id: "marketplace",
        name: "Marketplace",
        description: "Buy, sell, and trade 3D models and prints.",
        icon: "HiShoppingBag",
        order: 3,
    },
    {
        id: "art",
        name: "Art & Design",
        description: "Share and discuss 3D art and design.",
        icon: "HiPaintBrush",
        order: 4,
    },
    {
        id: "news",
        name: "News & Updates",
        description: "Latest news, updates, and announcements.",
        icon: "HiNewspaper",
        order: 5,
    },
    {
        id: "maintenance",
        name: "Maintenance",
        description: "Site maintenance and technical discussions.",
        icon: "HiWrenchScrewdriver",
        order: 6,
    },
];

// 🚀 Seeding function
async function seedForumCategories() {
    const batch = db.batch();
    const categoriesRef = db.collection("forumCategories");

    forumCategories.forEach((cat) => {
        const docRef = categoriesRef.doc(cat.id);
        batch.set(docRef, {
            ...cat,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
    });

    await batch.commit();
    console.log("✅ Forum categories seeded successfully.");
}

seedForumCategories().catch((err) => {
    console.error("❌ Forum categories seeding failed:", err);
});
