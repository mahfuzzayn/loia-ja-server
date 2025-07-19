import { Router } from "express";

import { LinkRoutes } from "../modules/link/link.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";

const router = Router();

const moduleRoutes = [
    {
        path: "/users",
        route: UserRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/links",
        route: LinkRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
