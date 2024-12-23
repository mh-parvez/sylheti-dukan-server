import { Router } from "express";
import { applyDiscount, newCoupon, allCoupons, deleteCoupon, createPaymentIntent } from "../controllers/payment";
import { adminOnly } from "../middlewares/auth";

const router = Router();

// create payment - /api/v1/payment/create
router.post("/create", createPaymentIntent);

// discount apply - /api/v1/payment/discount/apply
router.get("/discount/apply", applyDiscount);

// create new coupon - /api/v1/payment/coupon/new
router.post("/coupon/new", adminOnly, newCoupon);

// get all coupons - /api/v1/payment/coupon/all
router.get("/coupon/all", adminOnly, allCoupons);

// delete coupon - /api/v1/payment/coupon/:id
router.delete("/coupon/:id", adminOnly, deleteCoupon);

export default router;
