import { Link } from "react-router-dom";
import { ModelData } from "@/features/models/types/model";
import { SequentialImage } from "@/features/shared/reusable/SequentialImage";

export const HomeModelsGrid = ({
  models,
  loadIndex,
  bumpIndex,
}: {
  models: ModelData[];
  loadIndex: number;
  bumpIndex: () => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 select-none sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {models.map((m, idx) => (
        <Link key={m.id} to={`/model/${m.id}`} className="group">
          <article
            className="relative w-full cursor-pointer select-none overflow-hidden rounded-lg border border-br-subtle/70 bg-surface-card shadow-sm transition-all duration-300 ease-out hover:border-accent/30 hover:shadow-lg"
            style={{
              opacity: 0,
              animation: "fadeIn 0.5s ease-out forwards",
              // animationDelay: `${idx * 5}ms`,
            }}
          >
            {/* Image container with zoom effect */}
            <div className="aspect-square min-h-[1px] overflow-hidden bg-muted pointer-events-none">
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
            <div className="pointer-events-none absolute inset-0 flex translate-y-3 items-end rounded-lg bg-gradient-to-t from-surface-overlay via-surface-overlay/35 to-transparent p-3 text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              <div className="w-full">
                <div>
                  <p className="mb-0.5 truncate text-sm font-bold leading-tight text-white drop-shadow-lg md:text-[0.95rem]">
                    {m.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[0.72rem] font-medium text-white/80">
                      by {m.uploaderDisplayName}
                    </span>
                    <div className="h-0.5 w-0.5 rounded-full bg-white/55" />
                    <span className="text-[0.65rem] text-white/60">3D Model</span>
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
