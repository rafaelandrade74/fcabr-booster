import { storageKeyGoaRankStatus } from "../content-scripts/routes/profile.js";
import {
    storageKeyExperienceRankingPosition,
    storageKeyFireteamClan,
    storageKeyFireteamClanPlayer,
    storageKeyFireteamUserClan
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
        regex: /^fcabr:\/\/ranking\/fireteam\/clan$/,
        storageKey: storageKeyFireteamClan
    },
    {
        regex: /^fcabr:\/\/ranking\/fireteam\/clan\/player$/,
        storageKey: storageKeyFireteamClanPlayer
    },
    {
        regex: /^fcabr:\/\/ranking\/fireteam\/user-clan$/,
        storageKey: storageKeyFireteamUserClan
    }
];

