import express from "express";
import clientInfoParser from "../../middleware/clientInfoParser";
import { AuthController } from "./auth.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";

const router = express.Router();

router.post("/login", clientInfoParser, AuthController.loginUser);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
    "/change-password",
    auth(UserRole.GUEST, UserRole.USER, UserRole.ADMIN),
    AuthController.changePassword
);

router.post("/forgot-password", AuthController.forgotPassword);

router.post('/verify-otp', AuthController.verifyOtp)

router.post('/reset-password', AuthController.resetPassword)

export const AuthRoutes = router;
