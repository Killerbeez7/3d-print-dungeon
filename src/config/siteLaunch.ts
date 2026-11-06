/**
 * Before launch, printdungeon.com shows a coming-soon page to everyone except admins and
 * testers (see PrelaunchGate). Launch = set the GitHub variable VITE_SITE_LAUNCHED=true, let the
 * preview rebuild, then publish it. Previews stay open so work can be checked there; add
 * `?prelaunch=1` to a preview address to see the gate, `?prelaunch=0` to turn it off again.
 */
export const SITE_LAUNCHED = import.meta.env.VITE_SITE_LAUNCHED === "true";

const LIVE_HOSTS = [
  "printdungeon.com",
  "www.printdungeon.com",
  "print-dungeon-3d.web.app",
  "print-dungeon-3d.firebaseapp.com",
];

const PREVIEW_GATE_KEY = "prelaunch-preview";

function gateForcedOnPreview(): boolean {
  try {
    const flag = new URLSearchParams(window.location.search).get("prelaunch");
    if (flag === "1") sessionStorage.setItem(PREVIEW_GATE_KEY, "1");
    if (flag === "0") sessionStorage.removeItem(PREVIEW_GATE_KEY);
    return sessionStorage.getItem(PREVIEW_GATE_KEY) === "1";
  } catch {
    return false;
  }
}

export const PRELAUNCH_GATE =
  !SITE_LAUNCHED && (LIVE_HOSTS.includes(window.location.hostname) || gateForcedOnPreview());

/**
 * Pages everyone can open before launch: the policies, the password reset link from emails, and
 * the 3D preview rip test (so friends can try to rip a scrambled preview).
 */
export const OPEN_BEFORE_LAUNCH = ["/policies", "/reset-password", "/lab/rip-test"];
