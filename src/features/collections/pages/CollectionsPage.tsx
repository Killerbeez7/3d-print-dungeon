import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routeConstants";

export const CollectionsPage = () => {
  return (
    <main className="min-h-screen text-txt-primary">
      <section className="px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold">Collections</h1>

          <p className="text-lg text-txt-secondary">
            Browse curated collections of 3D models and artwork.
          </p>
        </div>

        <div className="flex justify-center gap-10">
          <Link
            to={ROUTES.COLLECTIONS_RISING}
            className="rounded-3xl bg-accent-dark/30 px-4 py-2 text-txt-primary transition-colors hover:text-accent-hover"
          >
            Rising Models
          </Link>

          <span className="cursor-default rounded-3xl bg-muted px-4 py-2 text-txt-muted">
            Featured Models
          </span>
        </div>
      </section>
    </main>
  );
};
