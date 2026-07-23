import { RouteKeys } from "../../data/routekeys.js";

export function storageKeyExperienceRankingPosition(data) {
    if (!data?.oidUser) return null;
    return `${RouteKeys.ExperienceRankingPosition}-${data.oidUser}`;
}

export function storageKeyFireteamClan(data) {
    if (!data?.oidGuild) return null;
    return `${RouteKeys.FireteamClan}-${data.oidGuild}`;
}

export function storageKeyFireteamClanPlayer(data) {
    if (!data?.oidUser) return null;
    return `${RouteKeys.FireteamClanPlayer}-${data.oidUser}`;
}

export function storageKeyFireteamUserClan(data) {
    if (!data?.oidUser) return null;
    return `${RouteKeys.FireteamUserClan}-${data.oidUser}`;
}
