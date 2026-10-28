import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

import { buttonClassName } from "@/components";
import { ROUTES } from "@/constants/routeConstants";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";
import { StatePanel } from "@/features/shared/components/StatePanel";

// The blog had only demo posts with made-up authors, so this page stays empty
// until real posts exist.
export const BlogPage = () => (
  <StatePanel
    icon={Newspaper}
    eyebrow="Blog"
    title="No posts yet"
    actions={
      <>
        <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
          Go to the forum
        </Link>
        <Link to={ROUTES.HOME} className={buttonClassName({ variant: "secondary" })}>
          Browse models
        </Link>
      </>
    }
  >
    News and printing guides will be published here. For now, ask questions and share your
    prints in the forum.
  </StatePanel>
);
