import { model, Schema } from "mongoose";
import { ILink } from "./link.interface";

const linkSchema = new Schema<ILink>(
    {
        originalUrl: {
            type: String,
            required: true,
        },
        shortCode: {
            type: String,
            default: null,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Link = model<ILink>("links", linkSchema);
