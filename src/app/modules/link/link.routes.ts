import express from "express";
import { LinkController } from "./link.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import clientInfoParser from "../../middleware/clientInfoParser";

const router = express.Router();

router.post("/", auth(UserRole.USER), LinkController.createLink);

router.get("/", auth(UserRole.ADMIN), LinkController.getAllLinks);

router.post("/guest", clientInfoParser, LinkController.createGuestLink);

router.get(
    "/me",
    auth(UserRole.GUEST, UserRole.USER),
    LinkController.getMyLinks
);

// Retrieve link from Short Code or Alias and get redirected!
router.get("/:linkCode", LinkController.getSingleLink);

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
