import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { ILink } from "./link.interface";
import { Link } from "./link.model";
import { generateShortCode } from "./link.utils";
import { IJwtPayload } from "../auth/auth.interface";
import mongoose from "mongoose";
import { closePath } from "pdfkit";
import { ClickServices } from "../click/click.service";
import { Request } from "express";

const createLinkIntoDB = async (authUser: IJwtPayload, payload: ILink) => {
    payload.createdBy = new mongoose.Types.ObjectId(authUser?.userId);

    if (payload?.originalUrl) {
        const isLinkExistsByOriginalUrl = await Link.findOne({
            originalUrl: payload?.originalUrl,
            createdBy: authUser?.userId,
        });

        if (isLinkExistsByOriginalUrl) {
            return isLinkExistsByOriginalUrl;
        }
    }

    if (payload?.alias) {
        const isAliasExists = await Link.findOne({ alias: payload?.alias });

        if (isAliasExists) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                "Alias is already in use."
            );
        }
    } else {
        const shortCode = generateShortCode();
        payload.shortCode = shortCode;
    }

    const result = await Link.create(payload);

    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, "Failed to create link");
    }

    return result;
};

const getMyLinksFromDB = async (authUser: IJwtPayload) => {
    const links = await Link.find({
        createdBy: authUser?.userId,
        isActive: true,
    });

    if (!links) {
        throw new AppError(StatusCodes.NOT_FOUND, "No links were found.");
    }

    return links;
};

const getAllLinksFromDB = async () => {
    const links = await Link.find({ isActive: true });

    if (!links) {
        throw new AppError(StatusCodes.NOT_FOUND, "No links were found.");
    }

    return links;
};

// Retrieve link from Short Code or Alias and get redirected!
const getSingleLinkFromDB = async (req: Request, linkCode: string) => {
    const link = await Link.findOne({
        $or: [{ alias: linkCode }, { shortCode: linkCode }],
    });

    if (!link) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "No link were found by the provided link id."
        );
    }

    if (!link.isActive) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Link is unactive or deleted by user."
        );
    }

    // Count Link Click to Click Model
    await ClickServices.countClickIntoDB(req, link);

    return {
        redirectUrl: link?.originalUrl,
    };
};

const updateLinkIntoDB = async (linkId: string, payload: Partial<ILink>) => {
    const link = await Link.findById(linkId);

    if (!link) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "No link were found by the provided link id."
        );
    }

    if (!link.isActive) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Link is unactive or deleted by user."
        );
    }

    const updatedData: any = {};

    if (payload?.alias) {
        const isAliasExists = await Link.findOne({ alias: payload?.alias });

        if (isAliasExists) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                "Alias is already in use."
            );
        }

        updatedData.alias = payload?.alias;
        updatedData.shortCode = null;
    } else if (payload?.alias === "") {
        const shortCode = generateShortCode();
        updatedData.shortCode = shortCode;
        updatedData.alias = null;
    }

    if (payload?.originalUrl) {
        updatedData.originalUrl = payload?.originalUrl;
    }

    const updatedLink = await Link.findOneAndUpdate(
        { _id: linkId },
        { ...updatedData },
        { new: true }
    );

    return updatedLink;
};

const deleteLinkFromDB = async (linkId: string) => {
    const link = await Link.findById(linkId);

    if (!link) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "No link were found by the provided link id."
        );
    }

    if (!link.isActive) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Link is unactive or deleted by user."
        );
    }

    const deletedLink = await Link.findOneAndUpdate(
        { _id: linkId },
        { isActive: false },
        { new: true }
    );

    return deletedLink;
};

export const LinkServices = {
    createLinkIntoDB,
    getMyLinksFromDB,
    getAllLinksFromDB,
    getSingleLinkFromDB,
    updateLinkIntoDB,
    deleteLinkFromDB,
};
