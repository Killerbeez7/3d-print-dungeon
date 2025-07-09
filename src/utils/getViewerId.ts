import FingerprintJS from "@fingerprintjs/fingerprintjs";


export async function getViewerId(user?: { uid?: string } | string | null): Promise<string> {
    if (typeof user === "string") return user;
    if (user && typeof user === "object" && typeof user.uid === "string") return user.uid;

    let viewerId: string | null = localStorage.getItem("viewerId");
    if (!viewerId) {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        viewerId = result.visitorId;
        localStorage.setItem("viewerId", viewerId);
    }
    return viewerId;
}
