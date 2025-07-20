import mongoose, { Types } from "mongoose";
import { IClientInfo } from "../user/user.interface";

export interface ILink {
    _id: Types.ObjectId;
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    alias?: string;
    createdBy: Types.ObjectId;
    clicks: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILinkPayload extends ILink {
    clientInfo?: IClientInfo; // Only Needed for Guest User Registration Purposes
}

export type TLinkDocument = mongoose.Document<unknown, {}, ILink> &
    ILink &
    Required<{ _id: mongoose.Types.ObjectId }> & { __v: number };

export type TAuthInfo = { accessToken: string; refreshToken: string };

export type CreateGuestLinkResponse = {
    result: TLinkDocument;
    authInfo: TAuthInfo | null;
};
