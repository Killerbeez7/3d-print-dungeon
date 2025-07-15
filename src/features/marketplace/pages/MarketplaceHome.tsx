import { useState } from "react";
import { CategoryTabs } from "../components/CategoryTabs";
import { SubcategoryBar } from "../components/SubcategoryBar";
import { ProductTabs } from "../components/ProductTabs";
import { SearchAndFilters } from "../components/SearchAndFilters";
import { ProductGrid } from "../components/ProductGrid";

const categories = [
    { id: "all", label: "All 3D Models" },
    { id: "miniatures", label: "Miniatures" },
    { id: "terrain", label: "Terrain" },
    { id: "accessories", label: "Accessories" },
    { id: "vehicles", label: "Vehicles" },
    { id: "creatures", label: "Creatures" },
];
const subcategories = [
  { id: "stl", label: "STL Files" },
  { id: "presupported", label: "Pre-supported" },
  { id: "modular", label: "Modular Kits" },
  { id: "bases", label: "Bases" },
  { id: "scenery", label: "Scenery" },
];
const productTabs = ["Trending", "Top Rated", "Newest", "Popular", "Sale"];

const mockProducts = [
    { id: "1", name: "3D Sword", image: "/assets/sword.png", price: "$10" },
    { id: "2", name: "Fabric Brushes", image: "/assets/brushes.png", price: "$5" },
    // ...more
];

export const MarketplaceHome = () => {
    const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
    const [selectedSubcategory, setSelectedSubcategory] = useState(subcategories[0].id);
    const [selectedTab, setSelectedTab] = useState(productTabs[0]);

    // Filter products based on selected tab/category/subcategory (pseudo-code)
    const filteredProducts = mockProducts; // Replace with real filtering

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-6">Marketplace</h1>
            <CategoryTabs
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />
            <SubcategoryBar
                subcategories={subcategories}
                selected={selectedSubcategory}
                onSelect={setSelectedSubcategory}
            />
            <SearchAndFilters />
            <ProductTabs
                tabs={productTabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
            />
            <ProductGrid products={filteredProducts} />
        </div>
    );
};
