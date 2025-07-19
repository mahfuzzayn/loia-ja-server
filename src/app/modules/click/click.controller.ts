import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const countClick = catchAsync(async (req, res) => {
    const result = null;

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Click counted successfully.",
        data: result,
    });
});

export const ClickController = { countClick };
