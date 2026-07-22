import { RouteKeys } from "../../data/routekeys.js";

/**
 * @param {{ oidUser: number }} data
 * @returns {string|null}
 */
export function storageKeyExperienceRankingPosition(data) {
    if (!data?.oidUser) return null;
    return `${RouteKeys.ExperienceRankingPosition}-${data.oidUser}`;
}
