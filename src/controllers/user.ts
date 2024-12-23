import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { NewUserRequestBody } from "../types/type";
import { TryCatch } from "../middlewares/error";
import ErrorHandler from '../utils/utility.class';


// ------- Get All Users --------
export const getAllUsers: any = TryCatch(async (_req, res, _next) => {
	const users = await User.find({});

	return res.status(200).json({
		success: true,
		users
	})
});


// ------- Get Single User -------
export const getUser: any = TryCatch(async (req, res, next) => {

	const user = await User.findById(req.params.id);
	if (!user) return next(new ErrorHandler("Invaild id, user not found!", 400));

	return res.status(200).json({
		success: true,
		user
	})
});


// -------- Delete User --------
export const deleteUser: any = TryCatch(async (req, res, next) => {

	const user = await User.findById(req.params.id);
	if (!user) return next(new ErrorHandler("Invaild id, user not found!", 400));

	await user.deleteOne();

	return res.status(200).json({
		success: true,
		message: "User Deletd Successfully"
	})
});


// ------- Create New User -------
export const newUser: any = TryCatch(async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {

	const { name, email, photo, gender, _id, dob } = req.body;

	let user = await User.findById(_id);

	if (user) {
		return res.status(200).json({
			success: true,
			message: "Login Successfully"
		});
	};

	if (!_id || !name || !email || !photo || !gender || !dob) {
		return next(new ErrorHandler("Please Provide All Information", 400));
	};

	user = await User.create({ name, email, photo, gender, _id, dob, });

	return res.status(201).json({
		success: true,
		message: "Login Successfully",
	});
});
