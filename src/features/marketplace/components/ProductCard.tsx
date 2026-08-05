// ProductCard.tsx
import type { FC } from "react";
interface ProductCardProps {
    product: { id: string; name: string; image: string; price: string };
}
export const ProductCard: FC<ProductCardProps> = ({ product }) => (
    <div className="group overflow-hidden rounded-xl border border-br-subtle bg-bg-surface p-3 shadow-token-sm transition-all duration-300 hover:border-accent/30 hover:shadow-token-lg">
        <div className="mb-3 overflow-hidden rounded-lg border border-br-subtle bg-bg-muted">
            <img
                src={product.image}
                alt={product.name}
                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
        </div>
        <p className="font-semibold text-txt-primary">{product.name}</p>
        <p className="mt-1 text-sm font-semibold text-accent-text">{product.price}</p>
    </div>
);
