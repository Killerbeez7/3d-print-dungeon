import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";

import { buttonClassName } from "@/components";
import { ROUTES } from "@/constants/routeConstants";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";
import { StatePanel } from "@/features/shared/components/StatePanel";

// Events had only demo content (made-up contests and prizes), so this page
// stays empty until real events are stored and announced.
export const EventsHome = () => (
  <StatePanel
    icon={CalendarClock}
    eyebrow="Events"
    title="No events right now"
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
    Contests and meetups will be listed here. Until then, the forum is where the community
    meets.
  </StatePanel>
);
