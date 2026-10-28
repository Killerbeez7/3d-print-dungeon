import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Bell, Lock, Settings, ShieldCheck, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { STATIC_ASSETS } from "@/config/assetsConfig";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import { AccountSettings } from "../components/AccountSettings";
import { NotificationSettings } from "../components/NotificationSettings";
import { PrivacySettings } from "../components/PrivacySettings";
import { ProfileSettings } from "../components/ProfileSettings";
import { SecuritySettings } from "../components/SecuritySettings";

type SettingsTabId = "profile" | "account" | "notifications" | "privacy" | "security";

interface SettingsTab {
  id: SettingsTabId;
  label: string;
  hint: string;
  icon: LucideIcon;
}

const SETTINGS_TABS: SettingsTab[] = [
  { id: "profile", label: "Profile", hint: "Name, bio, picture", icon: User },
  { id: "account", label: "Account", hint: "Language, timezone, theme", icon: Settings },
  { id: "notifications", label: "Notifications", hint: "What we tell you", icon: Bell },
  { id: "privacy", label: "Privacy", hint: "What others see", icon: Lock },
  { id: "security", label: "Security", hint: "Password, sign-in", icon: ShieldCheck },
];

const isTabId = (value: string | null): value is SettingsTabId =>
  SETTINGS_TABS.some((tab) => tab.id === value);

export const SettingsPage = () => {
  const { authUser, currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const activeTab: SettingsTabId = isTabId(requestedTab) ? requestedTab : "profile";
  const setActiveTab = (tab: SettingsTabId) =>
    setSearchParams(tab === "profile" ? {} : { tab }, { replace: true });

  const photoURL = authUser?.photoURL ?? currentUser?.photoURL;
  // Cache-busted URLs change every call; compute once per photo.
  const avatarUrl = useMemo(() => getAvatarUrlWithCacheBust(photoURL), [photoURL]);
  const displayName = authUser?.displayName ?? currentUser?.displayName ?? "Anonymous";
  const email = authUser?.email ?? currentUser?.email ?? "";

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;

      case "account":
        return <AccountSettings />;

      case "notifications":
        return <NotificationSettings />;

      case "privacy":
        return <PrivacySettings />;

      case "security":
        return <SecuritySettings />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="label-mono text-accent">Your account</p>
        <h1 className="mt-2 text-3xl font-bold">Settings</h1>
      </header>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:sticky md:top-24 md:w-64 md:shrink-0 md:self-start">
          <div className="hidden items-center gap-3 border-b border-br-subtle pb-5 md:flex">
            <span className="chamfer size-12 shrink-0 overflow-hidden bg-muted [--cut:9px]">
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={(event) => {
                  const image = event.currentTarget;
                  if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
                    image.src = STATIC_ASSETS.DEFAULT_AVATAR;
                  }
                }}
                className="size-full object-cover"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-txt-primary">{displayName}</p>
              {email && <p className="truncate text-xs text-txt-muted">{email}</p>}
            </div>
          </div>

          <nav aria-label="Settings sections" className="md:mt-4">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-col md:px-0">
              {SETTINGS_TABS.map(({ id, label, hint, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <li key={id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors md:py-3 ${
                        isActive
                          ? "bg-accent-soft text-txt-primary"
                          : "text-txt-secondary hover:bg-muted hover:text-txt-primary"
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute inset-y-2 left-0 hidden w-0.5 bg-accent md:block"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={`size-4 shrink-0 ${isActive ? "text-accent" : ""}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block whitespace-nowrap text-sm font-medium">{label}</span>
                        <span className="hidden text-xs text-txt-muted md:block">{hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">{renderActiveTab()}</section>
      </div>
    </div>
  );
};
