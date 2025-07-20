import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { LinkServices } from "./link.service";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";
import config from "../../config";

const createGuestLink = catchAsync(async (req, res) => {
    const { result, authInfo } = await LinkServices.createGuestLinkIntoDB(
        req,
        req.body
    );

    if (authInfo) {
        const { accessToken, refreshToken } = authInfo;

        res.cookie("refreshToken", refreshToken, {
            secure: config.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Link created successfully",
            data: { ...result.toObject(), accessToken },
        });
    } else {
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Link created successfully",
            data: result,
        });
    }
});

const createLink = catchAsync(async (req, res) => {
    const result = await LinkServices.createLinkIntoDB(
        req.user as IJwtPayload,
        req.body
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Link created successfully",
        data: result,
    });
});

const getMyLinks = catchAsync(async (req, res) => {
    const result = await LinkServices.getMyLinksFromDB(req.user as IJwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Links retrieved successfully",
        data: result,
    });
});

const getAllLinks = catchAsync(async (req, res) => {
    const result = await LinkServices.getAllLinksFromDB();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Links retrieved successfully",
        data: result,
    });
});

const getSingleLink = catchAsync(async (req, res) => {
    const { linkCode } = req.params;
    const result = await LinkServices.getSingleLinkFromDB(req, linkCode);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Link retrieved successfully",
        data: result,
    });
});

const updateLink = catchAsync(async (req, res) => {
    const { linkId } = req.params;
    const result = await LinkServices.updateLinkIntoDB(linkId, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Link updated successfully",
        data: result,
    });
});

const deleteLink = catchAsync(async (req, res) => {
    const { linkId } = req.params;
    const result = await LinkServices.deleteLinkFromDB(linkId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Link deleted successfully",
        data: result,
    });
});

export const LinkController = {
    createGuestLink,
    createLink,
    getMyLinks,
    getAllLinks,
    getSingleLink,
    updateLink,
    deleteLink,
};
