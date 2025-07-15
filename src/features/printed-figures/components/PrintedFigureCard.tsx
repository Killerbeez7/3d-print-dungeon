import type { FC } from "react";

export interface PrintedFigure {
    id: string;
    name: string;
    image: string;
    price: string;
}

export const PrintedFigureCard: FC<{ figure: PrintedFigure }> = ({ figure }) => (
    <div className="bg-bg-surface rounded shadow p-2 flex flex-col items-center">
        <img
            src={figure.image}
            alt={figure.name}
            className="w-full h-40 object-cover rounded mb-2"
            loading="lazy"
        />
        <h3 className="font-semibold text-lg text-center mb-1">{figure.name}</h3>
        <p className="text-accent text-md font-bold">{figure.price}</p>
    </div>
);
