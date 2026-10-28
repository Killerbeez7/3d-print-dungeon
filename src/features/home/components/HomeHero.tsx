import { Link } from "react-router-dom";
import { ArrowDown, Upload } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
      <img
        src={HERO_IMAGE}
        alt=""
        width={768}
        height={512}
        fetchPriority="high"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-full object-cover opacity-35 md:w-3/5 md:opacity-100"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/85 to-page/40 md:bg-gradient-to-r md:from-page md:via-page/80 md:to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 md:py-20 lg:px-8">
        <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-txt-primary sm:text-4xl">
          3D printable models for your tabletop
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-txt-secondary md:text-lg">
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
    </section>
  );
};
