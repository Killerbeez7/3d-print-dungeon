import { Link } from "react-router-dom";
import { Skull } from "lucide-react";

import { buttonClassName } from "@/components";
import { ROUTES } from "@/constants/routeConstants";
import { StatePanel } from "@/features/shared/components/StatePanel";

export const NotFoundPage = () => (
  <StatePanel
    icon={Skull}
    eyebrow="404 · Print failed"
    title="This page fell off the build plate"
    actions={
      <>
        <Link to={ROUTES.HOME} className={buttonClassName()}>
          Browse models
        </Link>
        <Link to={ROUTES.SEARCH} className={buttonClassName({ variant: "secondary" })}>
          Search
        </Link>
      </>
    }
  >
    The link might be broken, or the page has moved.
  </StatePanel>
);
