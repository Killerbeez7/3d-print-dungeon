import { useState, useRef, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faImages,
  faHeart,
  faChartLine,
  faUser,
  faTrophy,
  faCog,
  faEye,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { H2, H3 } from "@/components/ResponsiveHeading";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import { ROUTES } from "@/constants/routeConstants";

import { useFetchUserModels } from "@/features/models/hooks/useFetchUserModels";
import type { ModelData } from "@/features/models/types/model";

import { ProgressiveImage } from "@/features/shared/reusable/ProgressiveImage";
import { ReusableCarousel } from "@/features/shared/reusable/carousel/ReusableCarousel";
import { Spinner } from "@/features/shared/reusable/Spinner";

import { getThumbnailUrl } from "@/utils/imageUtils";

import type { PublicProfileView } from "../types/profile";

type ProfileTabId = "uploads" | "likes" | "stats" | "achievements";

interface ProfileTab {
  id: ProfileTabId;
  label: string;
  icon: IconDefinition;
  count?: number;
}

interface ProfileSettingsPanelProps {
  user: PublicProfileView;
}

interface ModelCarouselCardProps {
  model: ModelData;
  priority?: boolean;
}

const getTabs = (user: PublicProfileView): ProfileTab[] => [
  {
    id: "uploads",
    label: "Uploads",
    icon: faImages,
    count: user.stats.uploadsCount,
  },
  {
    id: "likes",
    label: "Likes",
    icon: faHeart,
    count: user.stats.likesCount,
  },
  {
    id: "stats",
    label: "Stats",
    icon: faChartLine,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: faTrophy,
  },
];

const ModelCarouselCard = ({ model, priority = false }: ModelCarouselCardProps) => {
  const navigate = useNavigate();

  const mouseDownPos = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const thumbUrl =
    getThumbnailUrl(model.renderPrimaryUrl ?? null, "MEDIUM") ||
    STATIC_ASSETS.PLACEHOLDER_IMAGE;

  const handleMouseDown = (event: MouseEvent) => {
    mouseDownPos.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleClick = (event: MouseEvent) => {
    if (mouseDownPos.current) {
      const deltaX = Math.abs(event.clientX - mouseDownPos.current.x);

      const deltaY = Math.abs(event.clientY - mouseDownPos.current.y);

      if (deltaX > 5 || deltaY > 5) {
        event.preventDefault();
        return;
      }
    }

    navigate(`/model/${model.id}`);
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <article className="relative bg-bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out w-full">
        {/* Image container with zoom effect */}
        <div className="overflow-hidden" style={{ height: 160 }}>
          <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-110">
            {priority ? (
              <img
                src={thumbUrl}
                alt={model.name}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <ProgressiveImage
                src={thumbUrl}
                alt={model.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Enhanced overlay with slide-up animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-4 group-hover:translate-y-0 rounded-lg pointer-events-none">
          <div className="text-bg-reverse p-3 w-full">
            <div className="mb-1.5">
              <h6 className="font-bold text-xs leading-tight mb-0.5 truncate text-bg-reverse drop-shadow-lg">
                {model.name}
              </h6>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-txt-muted font-medium truncate">
                  by {model.uploaderDisplayName || "Unknown"}
                </span>

                <div className="w-0.5 h-0.5 bg-txt-muted rounded-full" />

                <span className="text-[9px] text-txt-muted">3D Model</span>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="w-2.5 h-2.5 text-bg-reverse"
                  />

                  <span className="text-[10px] text-bg-reverse font-medium">
                    {model.likes || 0}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faEye} className="w-2.5 h-2.5 text-bg-reverse" />

                  <span className="text-[10px] text-bg-reverse font-medium">
                    {model.views || 0}
                  </span>
                </div>
              </div>

              <div className="w-5 h-5 bg-txt-muted bg-opacity-20 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="w-2.5 h-2.5 text-bg-reverse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtle border glow on hover */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-accent transition-colors duration-300 pointer-events-none" />
      </article>
    </div>
  );
};

export const ProfileSettingsPanel = ({ user }: ProfileSettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("uploads");

  const { models: userModels, isLoading: modelsLoading } = useFetchUserModels(user.uid);

  const tabs = getTabs(user);

  const renderTabContent = () => {
    switch (activeTab) {
      case "uploads":
        return (
          <div className="bg-bg-surface rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <H3 size="lg" className="text-txt-primary">
                My Uploads ({user.stats.uploadsCount})
              </H3>

              <Link
                to="/upload"
                className="text-sm bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded-md transition-colors"
              >
                Upload New
              </Link>
            </div>

            <p className="text-txt-secondary mb-6">
              Manage your uploaded models. Here you can edit, delete, or change privacy
              settings.
            </p>

            {/* Models Carousel */}
            <div className="mt-4">
              {modelsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size={24} />
                </div>
              ) : userModels.length > 0 ? (
                <ReusableCarousel<ModelData>
                  items={userModels}
                  renderItem={(model, index) => (
                    <ModelCarouselCard model={model} priority={index < 6} />
                  )}
                  slidesToShow={6}
                  slidesToScroll={3}
                  infinite={false}
                  speed={500}
                  responsive={[
                    {
                      breakpoint: 1024,
                      settings: {
                        slidesToShow: 4,
                        slidesToScroll: 2,
                      },
                    },
                    {
                      breakpoint: 768,
                      settings: {
                        slidesToShow: 3,
                        slidesToScroll: 2,
                      },
                    },
                    {
                      breakpoint: 480,
                      settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                      },
                    },
                  ]}
                  containerClassName="px-2"
                />
              ) : (
                <div className="text-center py-8 text-txt-secondary">
                  <p>No models uploaded yet.</p>

                  <Link
                    to="/upload"
                    className="inline-block mt-2 text-accent hover:text-accent-hover"
                  >
                    Upload your first model →
                  </Link>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6">
              <Link
                to="/models/my-uploads"
                className="text-accent hover:text-accent-hover text-sm font-medium"
              >
                View All Uploads →
              </Link>
            </div>
          </div>
        );

      case "likes":
        return (
          <div className="bg-bg-surface rounded-lg p-6">
            <H3 size="lg" className="text-txt-primary mb-4">
              Liked Models ({user.stats.likesCount})
            </H3>

            <p className="text-txt-secondary mb-6">
              Your liked models. Organize them into collections or remove likes you no
              longer want.
            </p>

            {/* TODO: Replace with real liked-model data during the Likes slice. */}
            <div className="mt-4">
              <div className="text-center py-8 text-txt-secondary">
                <p>Liked models feature coming soon!</p>

                <p className="text-sm mt-2">Your liked models will be displayed here.</p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Link
                to="/models/liked"
                className="text-accent hover:text-accent-hover text-sm font-medium"
              >
                View All Liked Models →
              </Link>
            </div>
          </div>
        );

      case "stats":
        return (
          <div className="bg-bg-surface rounded-lg p-6">
            <h3 className="text-xl font-semibold text-txt-primary mb-4">
              Private Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-bg-secondary rounded">
                <div className="text-lg font-bold text-txt-primary">
                  {user.stats.viewsCount}
                </div>

                <div className="text-xs text-txt-secondary">Total Views</div>
              </div>

              <div className="text-center p-3 bg-bg-secondary rounded">
                <div className="text-lg font-bold text-txt-primary">
                  {user.stats.followersCount}
                </div>

                <div className="text-xs text-txt-secondary">Followers</div>
              </div>

              <div className="text-center p-3 bg-bg-secondary rounded">
                <div className="text-lg font-bold text-txt-primary">
                  {user.stats.followingCount}
                </div>

                <div className="text-xs text-txt-secondary">Following</div>
              </div>

              <div className="text-center p-3 bg-bg-secondary rounded">
                <div className="text-lg font-bold text-txt-primary">
                  {user.isPremium ? "Premium" : "Free"}
                </div>

                <div className="text-xs text-txt-secondary">Account</div>
              </div>
            </div>

            <p className="text-txt-secondary">
              Detailed analytics and insights about your profile performance.
            </p>
          </div>
        );

      case "achievements":
        return (
          <div className="bg-bg-surface rounded-lg p-6">
            <h3 className="text-xl font-semibold text-txt-primary mb-4">Achievements</h3>

            {/* TODO: Replace placeholder achievements with real achievement data. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-bg-secondary rounded-lg p-4 border border-br-secondary">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faTrophy} className="text-white" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-txt-primary">First Upload</h4>

                    <p className="text-sm text-txt-secondary">
                      Uploaded your first model
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-bg-secondary rounded-lg p-4 border border-br-secondary">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faHeart} className="text-white" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-txt-primary">Popular Creator</h4>

                    <p className="text-sm text-txt-secondary">Reached 1000+ likes</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg-secondary rounded-lg p-4 border border-br-secondary">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-txt-primary">Community Member</h4>

                    <p className="text-sm text-txt-secondary">Active for 1+ year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
      {/* Settings Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <H2 size="2xl" className="text-txt-primary">
            Profile Management
          </H2>

          <p className="text-sm text-txt-secondary">Welcome back, {user.displayName}!</p>
        </div>

        <Link
          to={ROUTES.USER_SETTINGS}
          className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all duration-200"
        >
          <FontAwesomeIcon icon={faCog} className="w-4 h-4" />

          <span>Settings</span>
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-br-secondary mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-txt-secondary hover:text-txt-primary hover:border-br-secondary"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />

              <span>{tab.label}</span>

              {typeof tab.count === "number" && (
                <span className="bg-bg-surface text-txt-secondary text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};
