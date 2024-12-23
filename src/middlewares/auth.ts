import { User } from "../models/user";
import ErrorHandler from "../utils/utility.class";
import { TryCatch } from "./error";

export const adminOnly:any = TryCatch(async(req, _res, next) => {
    
    const {id}  = req.query;
    if(!id) return next(new ErrorHandler("Invaild Id or not logged in", 401));

    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler("User not found on database", 401));

    if (user.role !== "admin") return next(new ErrorHandler("You are not admin", 403));

    next(); /* if every condition are false */
})
