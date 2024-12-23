import { stripe } from "../app";
import { TryCatch } from "../middlewares/error";
import { Coupon } from "../models/cupon";
import ErrorHandler from "../utils/utility.class";


//------ Create Payment ------
export const createPaymentIntent: any = TryCatch(async (req, res, next) => {
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount))) {
        return next(new ErrorHandler("Please enter a valid amount", 400));
    }
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount)),
            currency: "usd",
            payment_method: 'pm_card_visa',
            payment_method_types: ['card'],
        });

        return res.status(201).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        return next(new ErrorHandler("Payment Creation Failed", 500));
    }
});


//------ Create New Coupon  ------
export const newCoupon: any = TryCatch(async (req, res, next) => {

    const { coupon, amount } = req.body;
    if (!coupon || !amount) return next(new ErrorHandler("Please Enter both, Coupon & Amount", 404));

    await Coupon.create({ code: coupon, amount });

    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`
    });
});


//------ Apply Discount  ------
export const applyDiscount: any = TryCatch(async (req, res, next) => {

    const { coupon } = req.query;

    const discount = await Coupon.findOne({ code: coupon });
    if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

    return res.status(200).json({
        success: true,
        discount: discount.amount
    });
});


//------ Get All Coupon  ------
export const allCoupons: any = TryCatch(async (_req, res, _next) => {

    const coupons = await Coupon.find({});

    return res.status(200).json({
        success: true,
        coupons
    });
});


//------ Delete All Copon  ------
export const deleteCoupon: any = TryCatch(async (req, res, next) => {

    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return next(new ErrorHandler("Invalid Coupon Id", 400));

    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon.code} Deleted Successfully!`
    });
});

