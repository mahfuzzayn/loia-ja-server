import { Types } from "mongoose";

export interface ILink {
    _id: Types.ObjectId;
    originalUrl: string;
    shortCode: string;
    createdAt: Date;
    isPublic: Boolean;
}
