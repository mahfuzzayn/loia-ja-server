import { StatusCodes } from "http-status-codes";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import { IJwtPayload } from "./auth.interface";

const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUserFromDB(req.body);
    const { accessToken, refreshToken } = result!;

    res.cookie("refreshToken", refreshToken, {
        secure: config.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken,
        },
    });
});

const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;

    const result = await AuthServices.refreshTokenFromDB(
        refreshToken as string
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});

const changePassword = catchAsync(async (req, res) => {
    const result = await AuthServices.changePasswordIntoDB(
        req.user as IJwtPayload,
        req.body
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Password changed successfully!",
        data: null,
    });
});

const forgotPassword = catchAsync(async (req, res) => {
    await AuthServices.forgotPasswordFromDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Check your email to reset your password.",
        data: null,
    });
});

const verifyOtp = catchAsync(async (req, res) => {
    const result = await AuthServices.verifyOtpFromDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "OTP verified successfully.",
        data: result,
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const result = await AuthServices.resetPasswordIntoDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Password reset successfully.",
        data: result,
    });
});

export const AuthController = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    verifyOtp,
    resetPassword,
};
