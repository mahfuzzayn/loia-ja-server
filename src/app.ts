import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import os from "os";
import { StatusCodes } from "http-status-codes";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
const app: Application = express();

// Middlewares
app.use(
    cors({
        origin: ["http://localhost:3000", "https://loiaja.vercel.app"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

// Home Route
app.get("/", (req: Request, res: Response, next: NextFunction) => {
    const currentDateTime = new Date().toISOString();
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const serverHostname = os.hostname();
    const serverPlatform = os.platform();
    const serverUptime = os.uptime();

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Welcome to Loia Ja API Server",
        version: "1.0.0",
        clientDetails: {
            ipAddress: clientIp,
            accessedAt: currentDateTime,
        },
        serverDetails: {
            hostname: serverHostname,
            platform: serverPlatform,
            uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
                (serverUptime / 60) % 60
            )} minutes`,
        },
        developerContact: {
            email: "mahfuzzayn8@gmail.com",
            website: "https://mahfuzzayn.vercel.app",
        },
    });
});

// Global Error Handler
app.use(globalErrorHandler);

// Not Found Route
app.use(notFound);

export default app;
