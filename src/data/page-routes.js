import { profilePage } from "../content-scripts/routes/profile.js";

export const pageRoutes = [
    {
        regex: /^\/[a-z]{2}\/profile(?:\/[^/]+)?\/?$/,
        handler: profilePage
    }
]