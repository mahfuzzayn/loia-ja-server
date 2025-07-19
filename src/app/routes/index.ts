import { Router } from "express";

import { LinkRoutes } from "../modules/link/link.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ClickRoutes } from "../modules/click/click.routes";

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
    {
        path: "/clicks",
        route: ClickRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
