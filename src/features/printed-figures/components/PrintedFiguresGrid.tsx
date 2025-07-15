import type { FC } from "react";
import type { PrintedFigure } from "./PrintedFigureCard";
import { PrintedFigureCard } from "./PrintedFigureCard";

export const PrintedFiguresGrid: FC<{ figures: PrintedFigure[] }> = ({ figures }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {figures.map((figure) => (
            <PrintedFigureCard key={figure.id} figure={figure} />
        ))}
    </div>
);
