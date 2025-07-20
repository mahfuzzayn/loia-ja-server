import { Types } from "mongoose";
import { IClientInfo } from "../user/user.interface";

export interface ILink {
    _id: Types.ObjectId;
    originalUrl: string;
    shortCode: string;
    alias?: string;
    createdBy: Types.ObjectId;
    clicks: number;
    isActive: Boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILinkPayload extends ILink {
    guestId?: Types.ObjectId;
    clientInfo?: IClientInfo; // Only Needed for Guest User Registration Purposes
}
