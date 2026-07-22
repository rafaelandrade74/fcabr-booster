import { RouteKeys } from "../data/routekeys.js";
import { storageKeyGoaRankStatus } from "../content-scripts/routes/profile.js";
import { storageKeyExperienceRankingPosition } from "../content-scripts/routes/ranking.js";

export const apiRoutes = [
    {
        regex: /\/api\/goa-rank-status\?.*oidUser=\d+/,
        storageKey: storageKeyGoaRankStatus
    },
    {
        regex: /^fcabr:\/\/ranking\/experience-position$/,
        storageKey: storageKeyExperienceRankingPosition
    }
];

