import FingerprintJS from "@fingerprintjs/fingerprintjs";

export async function getViewerId(user) {
    if (typeof user === "string") return user;
    if (user && user.uid) return user.uid;

    let viewerId = localStorage.getItem("viewerId");
    if (!viewerId) {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        viewerId = result.visitorId;
        localStorage.setItem("viewerId", viewerId);
    }
    return viewerId;
}
