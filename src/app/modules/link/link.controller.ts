import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";

import { LinkServices } from "./link.service";
import sendResponse from "../../utils/sendResponse";

const createLink = catchAsync(async (req, res) => {
    const result = await LinkServices.createLinkIntoDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Link created successfully",
        data: result,
    });
});

export const LinkController = { createLink };
