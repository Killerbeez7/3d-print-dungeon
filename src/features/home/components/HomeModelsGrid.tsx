import { Link } from "react-router-dom";
import { ModelData } from "@/features/models/types/model";
import { SequentialImage } from "@/features/shared/reusable/SequentialImage";

export const HomeModelsGrid = ({models, loadIndex, bumpIndex}: {models: ModelData[], loadIndex: number, bumpIndex: () => void}) => {
    return (
        <div className="grid grid-cols-2 gap-2 select-none sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {models.map((m, idx) => (
                <Link key={m.id} to={`/model/${m.id}`} className="group">
                    <article
                        className="relative w-full cursor-pointer select-none overflow-hidden rounded-lg border border-br-subtle/70 bg-bg-surface shadow-token-sm transition-all duration-300 ease-out hover:border-accent/30 hover:shadow-token-lg"
                        style={{
                            opacity: 0,
                            animation: "fadeIn 0.5s ease-out forwards",
                            // animationDelay: `${idx * 5}ms`,
                        }}
                    >
                        {/* Image container with zoom effect */}
                        <div className="aspect-square min-h-[1px] overflow-hidden bg-bg-muted pointer-events-none">
                            <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-105">
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
                        </div>
                        
                        {/* Hover metadata */}
                        <div className="pointer-events-none absolute inset-0 flex items-end rounded-lg bg-gradient-to-t from-bg-page/95 via-bg-page/55 to-transparent p-3 text-txt-highlight opacity-0 translate-y-3 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                            <div className="w-full">
                                <div>
                                    <p className="mb-0.5 truncate text-sm font-bold leading-tight text-txt-highlight drop-shadow-lg md:text-[0.95rem]">
                                        {m.name}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="truncate text-[0.72rem] font-medium text-txt-highlight/78">
                                            by {m.uploaderDisplayName}
                                        </span>
                                        <div className="h-0.5 w-0.5 rounded-full bg-txt-highlight/55"></div>
                                        <span className="text-[0.65rem] text-txt-highlight/58">
                                            3D Model
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Subtle border glow on hover */}
                        <div className="pointer-events-none absolute inset-0 rounded-lg border border-transparent transition-colors duration-300 group-hover:border-accent/30"></div>
                    </article>
                </Link>
            ))}
        </div>
    );
};
