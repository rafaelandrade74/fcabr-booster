import { RouteKeys } from "../data/routekeys.js";

export const apiRoutes = [
    {
        regex: /\/api\/goa-rank-status\?.*oidUser=\d+/,
        storageKey: RouteKeys.GoaRankStatus
    }
];