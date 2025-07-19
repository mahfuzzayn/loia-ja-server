import express from "express";
import { LinkController } from "./link.controller";

const router = express.Router();

router.post("/create-link", LinkController.createLink);

export const LinkRoutes = router;
