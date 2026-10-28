import { Link } from "react-router-dom";
import { ArrowDown, Upload } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";
import { useModal } from "@/features/shared/modal/hooks/useModal";

const HERO_IMAGE = "/assets/images/hero-miniatures.webp";

interface HomeHeroProps {
  onBrowse: () => void;
}

export const HomeHero = ({ onBrowse }: HomeHeroProps) => {
  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  return (
    // data-theme="dark" keeps the hero a dark band in both themes: the artwork
    // has a black background that would clash with the light page.
    <section
      data-theme="dark"
      className="relative isolate overflow-hidden border-b border-br-subtle bg-page"
    >
      {/* The artwork "prints" in, layer by layer, when the page loads. */}
      <img
        src={HERO_IMAGE}
        alt=""
        width={768}
        height={512}
        fetchPriority="high"
        className="hero-print pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-full object-cover opacity-40 md:w-[62%] md:opacity-100"
      />
      <div className="bg-layer-lines absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/85 to-page/40 md:bg-gradient-to-r md:from-page md:via-page/75 md:to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-14 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
        <p className="label-mono flex items-center gap-2 text-accent">
          <span className="inline-block size-1.5 animate-pulse bg-ember-fill" aria-hidden="true" />
          Community 3D print library
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.02] tracking-tight text-txt-primary sm:text-5xl lg:text-6xl">
          3D printable models for your{" "}
          <span className="bg-gradient-to-r from-accent to-ember-fill bg-clip-text text-transparent">
            tabletop
          </span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-txt-secondary md:text-lg">
          Discover, download and share miniatures, terrain and props made by the community.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={onBrowse}
            rightIcon={<ArrowDown className="size-4" aria-hidden="true" />}
          >
            Browse models
          </Button>

          {currentUser ? (
            <Link to="/model/upload" className={buttonClassName({ variant: "secondary", size: "lg" })}>
              <Upload className="size-4" aria-hidden="true" />
              Upload a model
            </Link>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => open({ mode: "signup" })}
              leftIcon={<Upload className="size-4" aria-hidden="true" />}
            >
              Upload a model
            </Button>
          )}
        </div>
      </div>

      {/* Category ticker (decorative; the filters below are the real controls). */}
      <div
        className="marquee relative border-t border-br-subtle bg-page/60 py-3 backdrop-blur-sm"
        aria-hidden="true"
      >
        <div className="marquee-track label-mono flex w-max text-txt-muted">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 gap-8 pr-8">
              {MODEL_CATEGORIES.map((category) => (
                <span key={category.id} className="flex items-center gap-8">
                  {category.name}
                  <span className="text-ember">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
