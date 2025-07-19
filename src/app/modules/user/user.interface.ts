import { Model, Types } from "mongoose";

export enum UserRole {
    GUEST = "guest",
    USER = "user",
    ADMIN = "admin",
}

export interface IClientInfo {
    device: "pc" | "mobile";
    browser: string;
    ipAddress: string;
    pcName?: string;
    os?: string;
    userAgent?: string;
}

export interface IUser {
    _id: string;
    name: string | null;
    guestId: string | null;
    email: string | null;
    role: UserRole;
    clientInfo: IClientInfo;
    password: string | null;
    isActive: boolean;
    passwordChangedAt?: Date | null;
    otpToken?: string | null;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserModel extends Model<IUser> {
    isPasswordMatched(
        plainPassword: string,
        hashedPassword: string
    ): Promise<boolean>;
    isUserExistsByEmail(id: string): Promise<IUser>;
    checkUserExists(userId: string): Promise<IUser>;
}
