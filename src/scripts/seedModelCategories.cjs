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

const categories = [
    {
        id: "miniatures",
        name: "Miniatures",
        slug: "miniatures",
        description: "Humanoid figures, beasts, and characters for tabletop RPGs.",
        icon: "miniatures.svg",
    },
    {
        id: "terrains",
        name: "Terrains",
        slug: "terrains",
        description:
            "Environmental pieces like rocks, ruins, hills, and natural scenery.",
        icon: "terrains.svg",
    },
    {
        id: "buildings",
        name: "Buildings",
        slug: "buildings",
        description: "Structures like houses, towers, castles, and dungeon rooms.",
        icon: "buildings.svg",
    },
    {
        id: "heroes",
        name: "Heroes",
        slug: "heroes",
        description: "Playable character miniatures like knights, rogues, and mages.",
        icon: "heroes.svg",
    },
    {
        id: "monsters",
        name: "Monsters",
        slug: "monsters",
        description: "Enemy miniatures: undead, dragons, beasts, and fiends.",
        icon: "monsters.svg",
    },
    {
        id: "props",
        name: "Props",
        slug: "props",
        description: "Scenic accessories like chests, barrels, tables, and statues.",
        icon: "props.svg",
    },
    {
        id: "vehicles",
        name: "Vehicles",
        slug: "vehicles",
        description: "Printable wagons, ships, siege engines, and airships.",
        icon: "vehicles.svg",
    },
    {
        id: "sci-fi",
        name: "Sci-Fi",
        slug: "sci-fi",
        description:
            "Science-fiction themed models like mechs, aliens, and tech terrain.",
        icon: "sci-fi.svg",
    },
    {
        id: "modular-tiles",
        name: "Modular Tiles",
        slug: "modular-tiles",
        description: "Dungeon tiles, walls, and floor systems for building maps.",
        icon: "tiles.svg",
    },
    {
        id: "bases",
        name: "Bases",
        slug: "bases",
        description: "Decorative bases for miniatures across multiple themes.",
        icon: "bases.svg",
    },
    {
        id: "npc",
        name: "NPCs",
        slug: "npc",
        description: "Villagers, shopkeepers, and other non-combatant characters.",
        icon: "npc.svg",
    },
    {
        id: "bosses",
        name: "Bosses",
        slug: "bosses",
        description: "Large, detailed models for boss battles and major encounters.",
        icon: "bosses.svg",
    },
    {
        id: "scatter",
        name: "Scatter Terrain",
        slug: "scatter",
        description: "Smaller decorative items to enhance terrain realism.",
        icon: "scatter.svg",
    },
    {
        id: "traps",
        name: "Traps",
        slug: "traps",
        description: "Dangerous traps, pressure plates, spikes, and hazards.",
        icon: "traps.svg",
    },
    {
        id: "kits",
        name: "Kitbash Components",
        slug: "kits",
        description: "Modular parts to build your own custom models.",
        icon: "kits.svg",
    },
];

async function seedModelCategories() {
    const batch = db.batch();
    const categoriesRef = db.collection("categories");

    categories.forEach((cat) => {
        const docRef = categoriesRef.doc(cat.id);
        batch.set(docRef, {
            ...cat,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
    });

    await batch.commit();
    console.log("✅ Model categories seeded successfully.");
}

seedModelCategories().catch((err) => {
    console.error("❌ Model categories seeding failed:", err);
});
