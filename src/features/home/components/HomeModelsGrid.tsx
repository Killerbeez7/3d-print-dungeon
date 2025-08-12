import { Link } from "react-router-dom";
import { ModelData } from "@/features/models/types/model";
import { SequentialImage } from "@/features/shared/reusable/SequentialImage";

export const HomeModelsGrid = ({models, loadIndex, bumpIndex}: {models: ModelData[], loadIndex: number, bumpIndex: () => void}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 select-none">
            {models.map((m, idx) => (
                <Link key={m.id} to={`/model/${m.id}`} className="group">
                    <article
                        className="relative bg-bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out w-full cursor-pointer select-none"
                        style={{
                            opacity: 0,
                            animation: "fadeIn 0.5s ease-out forwards",
                            // animationDelay: `${idx * 5}ms`,
                        }}
                    >
                        {/* Image container with zoom effect */}
                        <div className="aspect-square min-h-[1px] overflow-hidden pointer-events-none">
                            <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-110">
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
                        
                        {/* Enhanced overlay with slide-up animation */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-black/30 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-4 group-hover:translate-y-0 rounded-lg">
                            <div className="text-white p-3 w-full">
                                <div className="mb-1.5">
                                    <h2 className="font-bold text-xs leading-tight mb-0.5 truncate text-white drop-shadow-lg" style={{ fontSize: '16px' }}>
                                        {m.name}
                                    </h2>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[12px] text-gray-300 font-medium">
                                            by {m.uploaderDisplayName}
                                        </span>
                                        <div className="w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                                        <span className="text-[10px] text-gray-400">
                                            3D Model
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Action indicator */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-white/90 font-medium">View</span>
                                    </div>
                                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Subtle border glow on hover */}
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/20 transition-colors duration-300 pointer-events-none"></div>
                    </article>
                </Link>
            ))}
        </div>
    );
};
