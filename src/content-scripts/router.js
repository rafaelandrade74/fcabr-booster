import { profilePage } from "./routes/profile.js";

export const apiRoutes = [
    {
        regex: /\/api\/profile\?.*userId=\d+/,
        handler: profilePage
    }
];

