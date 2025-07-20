import { Request } from "express";
import { ILink } from "../link/link.interface";
import { IClick } from "./click.interface";
import { UAParser } from "ua-parser-js";
import { Click } from "./click.model";
import mongoose from "mongoose";
import { Link } from "../link/link.model";

const countClickIntoDB = async (req: Request, link: ILink) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const userAgent = req.headers["user-agent"]!;
        const parser = new UAParser(userAgent);
        const deviceInfo = parser.getResult();
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        let location: any = null;

        try {
            const res = await fetch(`https://ipapi.co/${ip}/json/`);

            if (!res.ok) throw new Error("Failed to fetch location");

            location = await res.json();
        } catch (error) {
            location = null
        }

        const clickData: Partial<IClick> = {
            link: link?._id,
            ipAddress: ip as string,
            userAgent,
            location: {
                city: location?.city as string,
                country: location?.country_name as string,
                region: location?.region as string,
                latitude: location?.latitude as number,
                longitude: location?.longitude as number,
            },
            device: {
                browser: deviceInfo?.browser?.name as string,
                type: deviceInfo?.device?.type as string,
                model: deviceInfo?.device?.model as string,
                vendor: deviceInfo?.device?.vendor as string,
            },
            clickedAt: new Date(),
        };

        // Insert Click Details
        const click = new Click(clickData);
        await click.save({ session });

        // Update Link click count
        await Link.findOneAndUpdate(
            { _id: link?._id },
            { $inc: { clicks: 1 } },
            {
                new: true,
                session,
            }
        );

        await session.commitTransaction();

        return {
            message: "Click counted successfully",
        };
    } catch (error) {
        await session.abortTransaction();

        throw error;
    } finally {
        session.endSession();
    }
};

export const ClickServices = { countClickIntoDB };
