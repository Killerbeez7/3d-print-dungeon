// ProductGrid.tsx
import type { FC } from "react";
import { ProductCard } from "./ProductCard";
interface ProductGridProps {
    products: { id: string; name: string; image: string; price: string }[];
}
export const ProductGrid: FC<ProductGridProps> = ({ products }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
            <ProductCard key={p.id} product={p} />
        ))}
    </div>
);
