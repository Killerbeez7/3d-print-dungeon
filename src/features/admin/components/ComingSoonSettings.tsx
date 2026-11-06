import { useState } from "react";

import { Button } from "@/components";
import { PRELAUNCH_GATE, SITE_LAUNCHED } from "@/config/siteLaunch";
import { useComingSoon } from "@/features/prelaunch/hooks/useComingSoon";
import { setComingSoon } from "@/features/prelaunch/services/launchSettings";

/** Turns the coming-soon page off (everyone can use the site) and on again. */
export const ComingSoonSettings = () => {
  const { loading, comingSoon } = useComingSoon(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setSaving(true);
    setError(null);
    try {
      await setComingSoon(!comingSoon);
    } catch (err) {
      console.error("Changing the coming-soon page failed:", (err as { code?: string })?.code ?? err);
      setError("Couldn't change it. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-txt-primary">Coming-soon page</h3>
          <p className="mt-1 max-w-xl text-sm text-txt-secondary">
            While it&apos;s on, visitors to printdungeon.com see the coming-soon page; admins and testers see the site.
            Turn it off to let someone in (for example to sign up, so you can make them a tester), then turn it on
            again. Search engines stay out either way until launch.
          </p>
        </div>
        <span
          className={`label-mono shrink-0 rounded px-2 py-1 ${
            loading ? "bg-muted text-txt-muted" : comingSoon ? "bg-accent-soft text-accent" : "bg-success/15 text-success"
          }`}
          role="status"
        >
          {loading ? "Checking…" : comingSoon ? "On: visitors see coming soon" : "Off: site open to everyone"}
        </span>
      </div>
      {SITE_LAUNCHED && (
        <p className="text-sm text-txt-muted">The site is launched, so the coming-soon page isn&apos;t used.</p>
      )}
      {!SITE_LAUNCHED && !PRELAUNCH_GATE && (
        <p className="text-sm text-txt-muted">
          This is a preview address, which never shows the coming-soon page; the switch still affects printdungeon.com.
        </p>
      )}
      <Button variant={comingSoon ? "secondary" : "primary"} onClick={toggle} isLoading={saving} disabled={loading}>
        {comingSoon ? "Turn off: let everyone in" : "Turn on: show coming soon"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
};
