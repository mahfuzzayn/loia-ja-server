import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { IUser, UserRole } from "./user.interface";
import { User } from "./user.model";
import { AuthServices } from "../auth/auth.service";
import { guestIdGenerator } from "./user.utils";
import mongoose from "mongoose";

const registerUserIntoDB = async (payload: IUser) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { role, email, password, clientInfo } = payload;

        if ([UserRole.ADMIN].includes(payload?.role)) {
            throw new AppError(
                StatusCodes.NOT_ACCEPTABLE,
                "Invalid role, only guest or user is allowed."
            );
        }

        if (payload?.role === UserRole.USER) {
            const existingUser = await User.findOne({ email: payload?.email });

            if (existingUser) {
                throw new AppError(
                    StatusCodes.NOT_ACCEPTABLE,
                    "Email is already registered."
                );
            }
        }

        const user = new User(payload);

        if (user?.role === UserRole.GUEST) {
            user.guestId = guestIdGenerator();
        }

        const createdUser = await user.save({ session });

        await session.commitTransaction();

        return await AuthServices.loginUserFromDB({
            guestId: role === UserRole.GUEST ? user?.guestId : null,
            role: createdUser?.role,
            email: [UserRole.USER, UserRole.USER].includes(role) ? email : null,
            password: [UserRole.USER, UserRole.USER].includes(role)
                ? password
                : null,
            clientInfo,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;
    } finally {
        await session.endSession();
    }
};

export const UserServices = { registerUserIntoDB };
