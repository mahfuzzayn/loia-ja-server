import { IClientInfo, UserRole } from "../user/user.interface";

export interface IAuth {
    guestId: string | null;
    email: string | null;
    password: string | null;
    role: UserRole;
    clientInfo?: IClientInfo;
}

export interface IJwtPayload {
    userId: string;
    name: string;
    email: string;
    isActive: boolean;
    role: UserRole;
}
