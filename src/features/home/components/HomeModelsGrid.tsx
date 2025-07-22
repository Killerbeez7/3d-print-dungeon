import { Link } from "react-router-dom";
import { ModelData } from "@/features/models/types/model";
import { SequentialImage } from "@/features/shared/reusable/SequentialImage";

export const HomeModelsGrid = ({models, loadIndex, bumpIndex}: {models: ModelData[], loadIndex: number, bumpIndex: () => void}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1">
            {models.map((m, idx) => (
                <Link key={m.id} to={`/model/${m.id}`}>
                    <article
                        className="relative bg-bg-surface rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full"
                        style={{
                            opacity: 0,
                            animation: "fadeIn 0.5s ease-out forwards",
                            // animationDelay: `${idx * 5}ms`,
                        }}
                    >
                        <div className="aspect-square min-h-[1px]">
                            <SequentialImage
                                index={idx}
                                loadIndex={loadIndex}
                                src={m.renderPrimaryUrl ?? ""}
                                alt={m.name}
                                onLoad={bumpIndex}
                                width={400}
                                height={400}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000000dc] to-transparent flex items-end opacity-0 hover:opacity-100 transition-opacity rounded-md">
                            <div className="text-white m-2">
                                <h2 className="font-semibold" style={{ fontSize: "1rem" }}>
                                    {m.name}
                                </h2>
                                <p className="text-sm">{m.uploaderDisplayName}</p>
                            </div>
                        </div>
                    </article>
                </Link>
            ))}
        </div>
    );
};
