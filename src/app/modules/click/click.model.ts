import { model, Schema } from "mongoose";
import { IClick } from "./click.interface";

const locationSchema = {
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    region: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
};

const deviceSchema = {
    browser: {
        type: String,
    },
    type: {
        type: String,
    },
    vendor: {
        type: String,
    },
    model: {
        type: String,
    },
};

const clickSchema = new Schema<IClick>(
    {
        link: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Link",
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        device: deviceSchema,
        location: locationSchema,
        referer: { type: String },
        clickedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

export const Click = model<IClick>("clicks", clickSchema);
