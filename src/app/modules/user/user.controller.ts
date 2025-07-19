import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import config from "../../config";

const registerUser = catchAsync(async (req, res) => {
    const result = await UserServices.registerUserIntoDB(req.body);

    const { accessToken, refreshToken } = result!;

    res.cookie("refreshToken", refreshToken, {
        secure: config.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User registered successfully",
        data: {
            accessToken,
        },
    });
});

export const UserController = { registerUser };
