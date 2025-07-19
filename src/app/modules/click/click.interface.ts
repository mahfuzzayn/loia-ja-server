import { Types } from "mongoose";

export interface IClick {
    _id: Types.ObjectId;
    link: Types.ObjectId;
    ipAddress: string;
    userAgent: string;
    device: {
        browser: string;
        type: string;
        vendor: string;
        model: string;
    };
    location: {
        country: string;
        city: string;
        region: string;
        latitude: number;
        longitude: number;
    };
    referer: string;
    clickedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
