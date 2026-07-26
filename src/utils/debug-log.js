// __FCABR_DEBUG__ é injetado em tempo de build pelo webpack.DefinePlugin
// (true quando rodando via "npm run dev", false em "npm run build"/"npm run release").
/* eslint-disable no-console */
export function dlog(...args) {
    if (__FCABR_DEBUG__) console.log(...args);
}

export function dwarn(...args) {
    if (__FCABR_DEBUG__) console.warn(...args);
}

export function derror(...args) {
    if (__FCABR_DEBUG__) console.error(...args);
}
