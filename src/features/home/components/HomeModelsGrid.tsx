import { Link } from "react-router-dom";
import { ModelData } from "@/features/models/types/model";
import { SequentialImage } from "@/features/shared/reusable/SequentialImage";
import clsx from "clsx";

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
    <div className="grid grid-cols-2 gap-0.5 select-none sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {models.map((m, idx) => (
        <Link key={m.id} to={`/model/${m.id}`} className="group">
          <article
            className={clsx(
              "relative w-full cursor-pointer select-none overflow-hidden rounded-lg",
              "border border-br-subtle/70 bg-surface-card shadow-sm",
              "transition-all duration-300 ease-out",
              "hover:border-accent/30",
              "hover:ring-1 hover:ring-inset hover:ring-accent/30",
              "hover:shadow-lg"
            )}
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
                  <p className="truncate text-sm font-semibold leading-tight text-white">
                    {m.name}
                  </p>

                  <p className="mt-1 truncate text-xs font-medium text-white/70">
                    by {m.uploaderDisplayName}
                  </p>
                </div>
              </div>
              {/* TODO: add uploaderPhotoURL to model data */}
              {/* <div className="w-full">
                <p className="truncate text-sm font-semibold leading-tight text-white drop-shadow-lg">
                  {m.name}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <img
                    src={m.uploaderPhotoURL}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover"
                  />

                  <span className="truncate text-xs font-medium text-white/75">
                    {m.uploaderDisplayName}
                  </span>
                </div>
              </div> */}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
};
