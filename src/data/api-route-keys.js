import { RouteKeys } from "./routekeys.js";

// Fallback próprio: gravado a partir do oidUser retornado pela API quando o usuário
// acessa o próprio perfil (PFP), usado quando o site ainda não gravou
// "selected-profile-*" no localStorage (ex.: primeira sessão em outro navegador/perfil).
export const FALLBACK_OID_USER_KEY = "fcabr-fallback-oid-user";

function getProfileId() {
    const profileKey = Object.keys(localStorage)
        .find(k => k.startsWith("selected-profile-"));

    if (profileKey) {
        const profileValue = Number(localStorage.getItem(profileKey));
        if (!Number.isNaN(profileValue))
            return profileValue;
    }

    const fallbackValue = Number(localStorage.getItem(FALLBACK_OID_USER_KEY));
    return Number.isNaN(fallbackValue) ? null : fallbackValue;
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
