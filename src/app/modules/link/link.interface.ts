import { Types } from "mongoose";

export interface ILink {
    _id: Types.ObjectId;
    originalUrl: string;
    shortCode: string;
    alias: string;
    createdBy: Types.ObjectId;
    clicks: number;
    isActive: Boolean;
    createdAt: Date;
    updatedAt: Date;
}
