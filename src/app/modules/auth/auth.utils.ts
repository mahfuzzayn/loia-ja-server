import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { IJwtPayload } from "./auth.interface";
import { IClientInfo, IUser } from "../user/user.interface";
import config from "../../config";
import { User } from "../user/user.model";

export const createToken = (
    jwtPayload: IJwtPayload,
    secret: Secret,
    expiresIn: any
) => {
    return jwt.sign(jwtPayload, secret, {
        expiresIn,
    });
};

export const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
};

export const generateTokens = (user: IUser) => {
    const jwtPayload: IJwtPayload = {
        userId: user._id,
        name: user.name ?? "",
        email: user.email ?? "",
        isActive: user.isActive,
        role: user.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as string
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.jwt_refresh_expires_in as string
    );

    return { accessToken, refreshToken };
};

export const updateLoginInfo = async (
    userId: string,
    clientInfo: IClientInfo,
    session?: any
) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            clientInfo,
            lastLogin: new Date(),
        },
        { new: true, session }
    );
};
