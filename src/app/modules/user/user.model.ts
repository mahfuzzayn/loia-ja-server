import { model, Schema } from "mongoose";
import { IUser, UserModel, UserRole } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import AppError from "../../errors/appError";
import { StatusCodes } from "http-status-codes";

const clientInfoSchema = {
    device: {
        type: String,
        enum: ["pc", "mobile"],
        required: true,
    },
    browser: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    pcName: {
        type: String,
        default: null,
    },
    os: {
        type: String,
        default: null,
    },
    userAgent: {
        type: String,
        default: null,
    },
};

const userSchema = new Schema<IUser, UserModel>(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        guestId: {
            type: String,
        },
        role: {
            type: String,
            enum: [UserRole.GUEST, UserRole.USER, UserRole.ADMIN],
            default: UserRole.GUEST,
        },
        clientInfo: clientInfoSchema,
        password: {
            type: String,
            select: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        passwordChangedAt: {
            type: Date,
        },
        otpToken: {
            type: String,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password") || !user.password) {
        return next();
    }

    try {
        user.password = await bcrypt.hash(
            user.password,
            Number(config.bcrypt_salt_rounds)
        );

        next();
    } catch (error) {
        next(error as Error);
    }
});

userSchema.post("save", function (doc, next) {
    doc.password = "";
    next();
});

userSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.password;
        return ret;
    },
});

userSchema.statics.isPasswordMatched = async (
    plainPassword: string,
    hashedPassword: string
) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.statics.isUserExistsByEmail = async (email: string) => {
    return await User.findOne({ email }).select("+password");
};

userSchema.statics.checkUserExists = async (userId: string) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exists");
    }

    if (!existingUser.isActive) {
        throw new AppError(StatusCodes.NOT_ACCEPTABLE, "User is not active!");
    }

    return existingUser;
};

export const User = model<IUser, UserModel>("User", userSchema);
