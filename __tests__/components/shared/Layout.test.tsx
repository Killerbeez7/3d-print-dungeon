import { it, expect, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Layout from "@/components/shared/Layout";
import { ModalProvider } from "@/providers/modalProvider";

vi.mock("@/components/search/GlobalSearch", () => ({
    default: () => <div data-testid="search">search</div>,
}));

it("renders Navbar inside Layout", () => {
    render(
        <ModalProvider>
            <MemoryRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<div>home</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </ModalProvider>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
});
