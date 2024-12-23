import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility.class";
import { ControllerType } from "../types/type";

export const errorMiddleware = (error: ErrorHandler, _req: Request, res: Response, _next: NextFunction): void => {

	error.message = error.message || "Internal server error";
	error.statusCode = error.statusCode || 500;

	if (error.name === "CastError") error.message = "Invalid ID"

	res.status(error.statusCode).json({
		success: false,
		message: error.message,
	});
};

export const TryCatch = (func: ControllerType) => (req: Request, res: Response, next: NextFunction) => {
	return Promise.resolve(func(req, res, next)).catch(next);
};
