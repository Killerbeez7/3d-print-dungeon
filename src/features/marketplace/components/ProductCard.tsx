// ProductCard.tsx
import type { FC } from "react";
interface ProductCardProps {
    product: { id: string; name: string; image: string; price: string };
}
export const ProductCard: FC<ProductCardProps> = ({ product }) => (
    <div className="bg-[var(--bg-surface)] rounded-xl shadow-md hover:shadow-xl transition p-3 flex flex-col items-center">
        <img
            src={product.image}
            alt={product.name}
            className="w-full h-44 object-cover rounded-lg mb-2 border border-[var(--bg-tertiary)]"
        />
        <h3 className="mt-2 font-semibold text-center text-lg">{product.name}</h3>
        <p className="text-[var(--accent)] font-bold text-md">{product.price}</p>
    </div>
);
