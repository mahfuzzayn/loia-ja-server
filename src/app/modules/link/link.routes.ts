import express from "express";
import { LinkController } from "./link.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.GUEST, UserRole.USER),
    LinkController.createLink
);

router.get(
    "/",
    auth(UserRole.ADMIN),
    LinkController.getAllLinks
);

router.get(
    "/me",
    auth(UserRole.GUEST, UserRole.USER),
    LinkController.getMyLinks
);

router.get(
    "/:linkId",
    auth(UserRole.GUEST, UserRole.USER),
    LinkController.getSingleLink
);

router.patch(
    "/:linkId",
    auth(UserRole.GUEST, UserRole.USER),
    LinkController.updateLink
);

router.delete(
    "/:linkId",
    auth(UserRole.GUEST, UserRole.USER, UserRole.ADMIN),
    LinkController.deleteLink
);

export const LinkRoutes = router;
