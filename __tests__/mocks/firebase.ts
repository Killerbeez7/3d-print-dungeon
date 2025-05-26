import { vi } from "vitest";

/** firebase/app ----------------------------------------------------- */
vi.mock("firebase/app", () => {
    let apps: any[] = [];

    return {
        initializeApp: (cfg: unknown) => {
            const app = { name: "[DEFAULT]", options: cfg };
            apps.push(app);
            return app;
        },
        getApp: () => apps[0] ?? {},
        getApps: () => apps,
    };
});

/** firebase/firestore ---------------------------------------------- */
vi.mock("firebase/firestore", () => {
    return {
        getFirestore: () => ({}),
        doc: vi.fn(),
        getDoc: vi.fn(),
    };
});

/** firebase/auth ---------------------------------------------------- */
vi.mock("firebase/auth", () => {
    return {
        getAuth: () => ({}),
    };
});

/** add more stubs if you later import storage, functions, etc. */
