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
        },
        alias: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        clicks: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Link = model<ILink>("links", linkSchema);
