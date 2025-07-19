import express from "express";
import { UserController } from "./user.controller";
import clientInfoParser from "../../middleware/clientInfoParser";

const router = express.Router();

router.post("/", clientInfoParser, UserController.registerUser);

export const UserRoutes = router;
