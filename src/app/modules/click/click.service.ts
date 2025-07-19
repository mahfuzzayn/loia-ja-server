import { Request } from "express";
import { ILink } from "../link/link.interface";
import { IClick } from "./click.interface";
import { UAParser } from "ua-parser-js";
import { Click } from "./click.model";

const countClickIntoDB = async (req: Request, link: ILink) => {
    const userAgent = req.headers["user-agent"]!;
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const locationRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const location = await locationRes.json();

    const clickData: Partial<IClick> = {
        link: link?._id,
        ipAddress: ip as string,
        userAgent,
        location: {
            city: location?.city,
            country: location?.country_name,
            region: location?.region,
            latitude: location?.latitude,
            longitude: location?.longitude,
        },
        device: {
            browser: deviceInfo?.browser?.name as string,
            type: deviceInfo?.device?.type as string,
            model: deviceInfo?.device?.model as string,
            vendor: deviceInfo?.device?.vendor as string,
        },
        clickedAt: new Date(),
    };

    await Click.create(clickData);

    return {
        message: "Click counted successfully",
    };
};

export const ClickServices = { countClickIntoDB };
