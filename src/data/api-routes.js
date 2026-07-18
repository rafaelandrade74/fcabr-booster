import { RouteKeys } from "../data/routekeys.js";
import { storageKeyGoaRankStatus } from "../content-scripts/routes/profile.js"

export const apiRoutes = [
    {
        regex: /\/api\/goa-rank-status\?.*oidUser=\d+/,
        storageKey: storageKeyGoaRankStatus
    }
];

