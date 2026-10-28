import type { ChangeEvent } from "react";

import { SearchInput } from "./SearchInput";
import { SearchTabs } from "./SearchTabs";
import type { SearchTab } from "../types/search";

interface SearchHeaderProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  activeTab: SearchTab;
  onTabSwitch: (tab: SearchTab) => void;
}

/** Search band: big field, then Models / Artists tabs on its bottom edge. */
export const SearchHeader = ({
  value,
  onChange,
  onClear,
  activeTab,
  onTabSwitch,
}: SearchHeaderProps) => (
  <header className="relative isolate overflow-hidden border-b border-br-subtle bg-section">
    <div className="bg-layer-lines absolute inset-0 -z-10" aria-hidden="true" />
    <div
      className="absolute -left-24 -top-40 -z-10 size-96 rounded-full bg-accent/10 blur-3xl"
      aria-hidden="true"
    />
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="label-mono mb-3 text-accent">Search</h1>
      <SearchInput
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={activeTab === "artists" ? "Search artists" : "Search models"}
      />
      <div className="mt-4">
        <SearchTabs activeTab={activeTab} onTabSwitch={onTabSwitch} />
      </div>
    </div>
  </header>
);
