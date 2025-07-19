import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { User } from "../user/user.model";
import { IAuth, IJwtPayload } from "./auth.interface";
import {
    createToken,
    generateTokens,
    updateLoginInfo,
    verifyToken,
} from "./auth.utils";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IUser } from "../user/user.interface";
import { generateOtp } from "../../utils/generateOtp";
import jwt from "jsonwebtoken";
import { EmailHelper } from "../../utils/emailHelper";

const loginUserFromDB = async (payload: IAuth) => {
    if (payload?.guestId) {
        const user = await User.findOne({
            guestId: payload?.guestId,
        });

        if (!user) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                "This user is not found!"
            );
        }

        if (!user.isActive) {
            throw new AppError(
                StatusCodes.FORBIDDEN,
                "This user is not active!"
            );
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // Update User Login Session Details
        await updateLoginInfo(user?._id, payload?.clientInfo!);

        return {
            accessToken,
            refreshToken,
        };
    } else if (payload?.email && payload?.password) {
        const user = await User.findOne({ email: payload?.email }).select(
            "+password"
        );

        if (!user) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                "This user is not found!"
            );
        }

        if (!user.isActive) {
            throw new AppError(
                StatusCodes.FORBIDDEN,
                "This user is not active!"
            );
        }

        if (
            !(await User.isPasswordMatched(payload?.password!, user?.password!))
        ) {
            throw new AppError(
                StatusCodes.FORBIDDEN,
                "Password does not matches"
            );
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // Update User Login Session Details
        await updateLoginInfo(user?._id, payload?.clientInfo!);

        return {
            accessToken,
            refreshToken,
        };
    }
};

const refreshTokenFromDB = async (token: string) => {
    let verifiedToken = null;

    try {
        verifiedToken = verifyToken(token, config.jwt_refresh_secret as Secret);
    } catch (error) {
        throw new AppError(StatusCodes.FORBIDDEN, "Invalid Refresh Token");
    }

    const { userId } = verifiedToken;

    const isUserExists = await User.findById(userId);

    if (!isUserExists) {
        throw new AppError(StatusCodes.NOT_FOUND, "User does not exist!");
    }

    if (!isUserExists.isActive) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
    }

    const jwtPayload: IJwtPayload = {
        userId: isUserExists._id as string,
        name: (isUserExists.name ?? "") as string,
        email: (isUserExists.email ?? "") as string,
        isActive: isUserExists.isActive,
        role: isUserExists.role,
    };

    const newAccessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as Secret,
        config.jwt_access_expires_in as string
    );

    return {
        accessToken: newAccessToken,
    };
};

const changePasswordIntoDB = async (
    authUser: IJwtPayload,
    payload: { oldPassword: string; newPassword: string }
) => {
    const { userId } = authUser;
    const { oldPassword, newPassword } = payload;

    const user = await User.findOne({ _id: userId }).select("+password");

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
    }
    if (!user.isActive) {
        throw new AppError(StatusCodes.FORBIDDEN, "User is not active!");
    }

    const isOldPasswordCorrect = await User.isPasswordMatched(
        oldPassword,
        user?.password!
    );

    if (!isOldPasswordCorrect) {
        throw new AppError(StatusCodes.FORBIDDEN, "Incorrect old password.");
    }

    // Hash and Update the new Password
    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds)
    );

    await User.findOneAndUpdate({ _id: userId }, { password: hashedPassword });

    return { message: "Password changed successfully." };
};

const forgotPasswordFromDB = async (payload: Pick<IUser, "email">) => {
    const { email } = payload;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User not found!");
    }

    if (!user.isActive) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
    }

    const otp = generateOtp();

    const otpToken = jwt.sign({ otp, email }, config.jwt_otp_secret as string, {
        expiresIn: config.jwt_otp_expires_in as any,
    });

    await User.updateOne({ email }, { otpToken });
    const emailContent = await EmailHelper.createEmailContent(
        {
            otpCode: otp,
            userName: user.name,
        },
        "forgotpassword"
    );

    await EmailHelper.sendEmail(email!, emailContent, "Reset Password OTP");
    try {
    } catch (error) {
        await User.updateOne({ email }, { $unset: { otpToken: 1 } });

        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to send OTP email. Please try again later."
        );
    }
};

const verifyOtpFromDB = async ({
    email,
    otp,
}: {
    email: string;
    otp: string;
}) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
    }

    if (!user.otpToken || user.otpToken === "") {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "No OTP token found. Please request a new password reset OTP."
        );
    }

    const decodedOtpData = verifyToken(
        user.otpToken as string,
        config.jwt_otp_secret as string
    );

    if (!decodedOtpData) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            "OTP has expired or is invalid"
        );
    }

    if (decodedOtpData.otp !== otp.toString()) {
        throw new AppError(StatusCodes.FORBIDDEN, "Invalid OTP");
    }

    user.otpToken = null;
    await user.save();

    const resetToken = jwt.sign(
        { email },
        config.jwt_pass_reset_secret as string,
        {
            expiresIn: config.jwt_pass_reset_expires_in as any,
        }
    );

    return {
        resetToken,
    };
};

const resetPasswordIntoDB = async ({
    token,
    newPassword,
}: {
    token: string;
    newPassword: string;
}) => {
    try {
        const decodedData = verifyToken(
            token as string,
            config.jwt_pass_reset_secret as string
        );

        const user = await User.findOne({
            email: decodedData.email,
            isActive: true,
        });

        if (!user) {
            throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
        }

        const hashedPassword = await bcrypt.hash(
            String(newPassword),
            Number(config.bcrypt_salt_rounds)
        );

        await User.updateOne(
            { email: user?.email },
            { password: hashedPassword }
        );

        return {
            message: "Password reset successfully",
        };
    } catch (error) {
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to reset password, Please try again."
        );
    }
};

export const AuthServices = {
    loginUserFromDB,
    refreshTokenFromDB,
    changePasswordIntoDB,
    forgotPasswordFromDB,
    verifyOtpFromDB,
    resetPasswordIntoDB,
};
