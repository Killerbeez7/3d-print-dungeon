import { setGlobalOptions } from "firebase-functions/v2";

// At most 10 instances per function. Plenty for this site, keeps a traffic
// spike from becoming a large bill, and stays inside the project's regional
// CPU quota (deploys failed with "Quota exceeded for total allowable CPU").
// Imported first in index.js so it applies before any function is defined.
setGlobalOptions({ maxInstances: 10 });
