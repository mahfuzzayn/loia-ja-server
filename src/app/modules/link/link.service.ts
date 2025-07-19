import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { ILink } from "./link.interface";
import { Link } from "./link.model";
import { generateShortCode } from "./link.utils";

const createLinkIntoDB = async (payload: ILink) => {
    let rnCode = generateShortCode();

    payload.shortCode = rnCode;

    const result = await Link.create(payload);

    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, "Failed to create link");
    }

    return result;
};

export const LinkServices = { createLinkIntoDB };
