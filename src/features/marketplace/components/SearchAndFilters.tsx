import type { FC } from "react";

export const SearchAndFilters: FC = () => (
  <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-br-subtle bg-section/75 p-3">
    <input
      type="text"
      placeholder="Search 3D models, designers, or keywords"
      className="min-w-64 flex-1 rounded-md border border-br-secondary bg-page px-4 py-2 text-sm text-txt-primary placeholder:text-txt-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
    />
    <select className="rounded-full border border-br-secondary bg-page px-3 py-1.5 text-sm text-txt-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15">
      <option>Format: All</option>
      <option>STL</option>
      <option>OBJ</option>
      <option>3MF</option>
    </select>
    <select className="rounded-full border border-br-secondary bg-page px-3 py-1.5 text-sm text-txt-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15">
      <option>License: All</option>
      <option>Commercial</option>
      <option>Personal</option>
    </select>
    <select className="rounded-full border border-br-secondary bg-page px-3 py-1.5 text-sm text-txt-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15">
      <option>Price: All</option>
      <option>Free</option>
      <option>Paid</option>
    </select>
  </div>
);
