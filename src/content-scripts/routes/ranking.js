import { RouteKeys } from "../../data/routekeys.js";

export function storageKeyExperienceRankingPosition(data) {
    if (!data?.oidUser) return null;
    return `${RouteKeys.ExperienceRankingPosition}-${data.oidUser}`;
}

export function storageKeyPlayerFireteamRanking(data) {
    if (!data?.oidUser) return null;
    return `${RouteKeys.PlayerFireteamRanking}-${data.oidUser}`;
}

export function storageKeyClanFireteamRanking(data) {
    if (!data?.oidGuild) return null;
    return `${RouteKeys.ClanFireteamRanking}-${data.oidGuild}`;
}
