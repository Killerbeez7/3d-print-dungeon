import type { FC } from "react";

export const SearchAndFilters: FC = () => (
    <div className="flex flex-wrap gap-4 mb-8 items-center">
        <input
            type="text"
            placeholder="Search 3D models, designers, or keywords"
            className="flex-1 px-4 py-2 rounded-lg border border-[var(--bg-tertiary)] focus:border-[var(--accent)] transition"
        />
        <select className="px-3 py-1 rounded-full border border-[var(--bg-tertiary)] focus:border-[var(--accent)]">
            <option>Format: All</option>
            <option>STL</option>
            <option>OBJ</option>
            <option>3MF</option>
        </select>
        <select className="px-3 py-1 rounded-full border border-[var(--bg-tertiary)] focus:border-[var(--accent)]">
            <option>License: All</option>
            <option>Commercial</option>
            <option>Personal</option>
        </select>
        <select className="px-3 py-1 rounded-full border border-[var(--bg-tertiary)] focus:border-[var(--accent)]">
            <option>Price: All</option>
            <option>Free</option>
            <option>Paid</option>
        </select>
    </div>
);
