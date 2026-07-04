import { profilePage } from "./routes/profile.js";

export const apiRoutes = [
    {
        regex: /\/api\/goa-rank-status\?.*oidUser=\d+/,
        handler: profilePage
    }
];

