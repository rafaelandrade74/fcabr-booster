import { RouteKeys } from "./routekeys.js";

function getProfileId() {
    const profileKey = Object.keys(localStorage)
        .find(k => k.startsWith("selected-profile-"));

    if (!profileKey)
        return null;

    const profileValue = Number(localStorage.getItem(profileKey));

    if (Number.isNaN(profileValue))
        return null;

    return profileValue;
}

export function RouteKeyProfile(name = null) {
    if (name == null || name == undefined) {
        const oidUser = getProfileId();

        if (oidUser == null) return null;
        return RouteKeyProfile(oidUser);
    }

    return `${RouteKeys.GoaRankStatus}-${name}`;
}

export function storageKeyGoaRankStatus(data) {
    const oidUser = data.data.oidUser;
    const nickname = data.data.nickname;

    const keyByOid = RouteKeyProfile(oidUser);
    const keyByNickname = RouteKeyProfile(nickname);

    return keyByOid === keyByNickname ? keyByOid : [keyByOid, keyByNickname];
}
