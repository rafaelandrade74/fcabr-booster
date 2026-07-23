import { storageKeyGoaRankStatus } from "../content-scripts/routes/profile.js";
import {
    storageKeyExperienceRankingPosition,
    storageKeyPlayerFireteamRanking,
    storageKeyClanFireteamRanking,
    storageKeyFireteamUserMeta
} from "../content-scripts/routes/ranking.js";

export const apiRoutes = [
    {
        regex: /\/api\/goa-rank-status\?.*oidUser=\d+/,
        storageKey: storageKeyGoaRankStatus
    },
    {
        regex: /^fcabr:\/\/ranking\/experience-position$/,
        storageKey: storageKeyExperienceRankingPosition
    },
    {
        regex: /^fcabr:\/\/ranking\/fireteam\/player$/,
        storageKey: storageKeyPlayerFireteamRanking
    },
    {
        regex: /^fcabr:\/\/ranking\/fireteam\/clan$/,
        storageKey: storageKeyClanFireteamRanking
    },
    {
        regex: /^fcabr:\/\/ranking\/fireteam\/meta$/,
        storageKey: storageKeyFireteamUserMeta
    }
];

