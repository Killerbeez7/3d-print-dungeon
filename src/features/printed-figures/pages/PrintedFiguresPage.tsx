import type { FC } from "react";
import { PrintedFiguresGrid } from "../components/PrintedFiguresGrid";
import type { PrintedFigure } from "../components/PrintedFigureCard";

const mockPrintedFigures: PrintedFigure[] = [
    {
        id: "1",
        name: "Dragon Warrior Miniature",
        image: "/assets/printed-figures/dragon-warrior.jpg",
        price: "$25",
    },
    {
        id: "2",
        name: "Sci-Fi Soldier",
        image: "/assets/printed-figures/sci-fi-soldier.jpg",
        price: "$20",
    },
    {
        id: "3",
        name: "Fantasy Archer",
        image: "/assets/printed-figures/fantasy-archer.jpg",
        price: "$22",
    },
    {
        id: "4",
        name: "Steampunk Golem",
        image: "/assets/printed-figures/steampunk-golem.jpg",
        price: "$30",
    },
];

export const PrintedFiguresPage: FC = () => {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-6 text-[var(--txt-primary)]">
                Printed Figures
            </h1>
            <p className="text-lg text-[var(--txt-secondary)] mb-8">
                Browse our collection of high-quality, already printed figures ready to
                ship to your door.
            </p>
            <PrintedFiguresGrid figures={mockPrintedFigures} />
        </div>
    );
};
